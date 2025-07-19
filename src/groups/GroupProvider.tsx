import { useGlobalState, useGlobalContext } from 'global/GlobalProvider'
import React, { createContext, useContext, useReducer, useCallback, Dispatch } from 'react';

import {
  ActionTypes, IGroup, IAnswer, IGroupsContext,
  IGroupDto, IGroupDtoEx, IGroupDtoListEx, IGroupKey, IGroupKeyExtended, IGroupKeyExpanded,
  GroupKey, Group, GroupDto,
  IAnswerDto, IAnswerDtoEx, IAnswerEx, IAnswerRowDto, IAnswerKey, IAnswerRow,
  Answer, AnswerDto, AnswerRow,
  AnswerRowDto,
  IParentInfo,
  IGroupRow,
  IGroupRowDtoEx,
  GroupRow,
  IGroupRowDto,
  ILoadGroupAnswers,
  AnswerKey,
  FormMode,
  GroupRowDto,
  IExpandInfo
} from 'groups/types';

import { initialGroupsState, GroupReducer, initialAnswer, initialGroup } from 'groups/GroupReducer';
import { IWhoWhen, Dto2WhoWhen, WhoWhen2Dto } from 'global/types';
import { protectedResources } from 'authConfig';
import { group } from 'console';

const GroupsContext = createContext<IGroupsContext>({} as any);
const GroupDispatchContext = createContext<Dispatch<any>>(() => null);

type Props = {
  children: React.ReactNode
}

export const GroupProvider: React.FC<Props> = ({ children }) => {

  const { loadAndCacheAllGroupRows, globalGetGroupRow, setNodesReloaded } = useGlobalContext()
  const globalState = useGlobalState();
  const { dbp, groupRows, authUser, canEdit } = globalState;
  const { nickName } = authUser;

  const [state, dispatch] = useReducer(GroupReducer, initialGroupsState);
  const { formMode, activeGroup, activeAnswer } = state;

  console.log('----->>> GroupProvider')


  const Execute = async (
    method: string,
    endpoint: string,
    data: Object | null = null,
    whichRowId: string | undefined = undefined
  ): Promise<any> => {
    const accessToken = localStorage.getItem("accessToken");
    if (accessToken) {
      try {
        console.log("------------&&&&&&&&&&&&&&&------Execute endpoint:", endpoint)
        let response = null;

        const headers = new Headers();
        const bearer = `Bearer ${accessToken}`;
        headers.append("Authorization", bearer);

        if (data) headers.append('Content-Type', 'application/json');

        let options = {
          method: method,
          headers: headers,
          body: data ? JSON.stringify(data) : null,
        };

        response = (await fetch(endpoint, options));
        if (response.ok) {
          if ((response.status === 200 || response.status === 201)) {
            let responseData = null; //response;
            try {
              responseData = await response.json();
            }
            catch (error) {
              dispatch({
                type: ActionTypes.SET_ERROR, payload: {
                  error: new Error(`Response status: ${response.status}`),
                  whichRowId
                }
              });
            }
            finally {
              return responseData;
            }
          }
        }
        else {
          const { errors } = await response.json();
          const error = new Error(
            errors?.map((e: { message: any; }) => e.message).join('\n') ?? 'unknown',
          )
          dispatch({ type: ActionTypes.SET_ERROR, payload: { error, whichRowId } });
        }
      }
      catch (e) {
        console.log('-------------->>> execute', method, endpoint, e)
        dispatch({ type: ActionTypes.SET_ERROR, payload: { error: new Error(`fetch eror`), whichRowId } });
      }
    }
    return null;
  }
  // }, [dispatch]);

  const loadTopGroupRows = useCallback(async () => {
    return new Promise(async (resolve) => {
      const { keyExpanded } = state;
      try {
        dispatch({ type: ActionTypes.SET_LOADING_GROUPS, payload: {} });
        const url = `${protectedResources.KnowledgeAPI.endpointGroupRow}/null/null`;
        console.log('GroupProvider loadTopGroupRows url:', url)
        console.time();
        await Execute("GET", url)
          .then((dtos: IGroupRowDto[]) => {
            console.timeEnd();
            const topRows = dtos!.map((dto: IGroupRowDto) => {
              dto.IsExpanded = keyExpanded
                ? dto.Id === keyExpanded.id
                : false;
              dto.RootId = dto.Id;
              return new GroupRow(dto).groupRow;
            })
            dispatch({ type: ActionTypes.SET_TOP_ROWS, payload: { topRows } });
            resolve(topRows);
          });
      }
      catch (error: any) {
        console.log(error)
        dispatch({ type: ActionTypes.SET_ERROR, payload: { error } });
      }
    })
  }, [dispatch]);


  const openNode = useCallback(
    async (groupKeyExp: IGroupKeyExpanded, fromChatBotDlg: string = 'false'): Promise<any> => {
      return new Promise(async (resolve) => {
        try {
          dispatch({ type: ActionTypes.SET_LOADING_GROUPS, payload: {} });
          console.log('---GroupProvider.openNode groupKeyExpanded:', groupKeyExp)
          let { id, partitionKey } = groupKeyExp;
          console.assert(id);
          if (id && partitionKey === '') {
            const groupRow: IGroupRow | undefined = groupRows.get(id);
            if (groupRow) {
              groupKeyExp.partitionKey = groupRow.topId;
              partitionKey = groupRow.topId;
            }
            else {
              alert('reload all groupRow:' + id)
              //return
            }
          }
          dispatch({ type: ActionTypes.NODE_OPENING, payload: {} })
          // ---------------------------------------------------------------------------
          console.time();
          const url = `${protectedResources.KnowledgeAPI.endpointGroupRow}/${partitionKey}/${id}/true`;
          console.log('calling CatController.GetCatsUpTheTree', url)
          await Execute("GET", url)
            .then(async (groupRowDtoEx: IGroupRowDtoEx) => {
              //dispatch({ type: ActionTypes.CLEAN_SUB_TREE, payload: { groupKey: groupKey! } });
              const { groupRowDto, msg } = groupRowDtoEx;
              console.timeEnd();
              if (groupRowDto) {
                const groupRow = new GroupRow(groupRowDto).groupRow; // deep clone dto
                dispatch({
                  type: ActionTypes.SET_NODE_OPENED, payload: {
                    keyExpanded: groupKeyExp,
                    groupRow,
                    answerId: groupKeyExp.answerId,
                    fromChatBotDlg: fromChatBotDlg === 'true'
                  }
                })
                //resolve(true)
              }
              else {
                //resolve(false)
              }
            });
        }
        catch (error: any) {
          console.log(error)
          dispatch({ type: ActionTypes.SET_ERROR, payload: { error } });
        }
      })
    }, [dispatch]);


  // get group With subgroupRows and answerRows
  const getGroup = async (groupKey: IGroupKey, includeAnswerId: string | null): Promise<any> => {
    const { partitionKey, id } = groupKey;
    console.log({ groupKey, includeAnswerId })
    return new Promise(async (resolve) => {
      try {
        const url = `${protectedResources.KnowledgeAPI.endpointGroup}/${partitionKey}/${id}/${PAGE_SIZE}/${includeAnswerId}`;
        console.time()
        await Execute("GET", url)
          .then((groupDtoEx: IGroupDtoEx) => {
            console.timeEnd();
            const { groupDto, msg } = groupDtoEx;
            if (groupDto) {
              resolve(new Group(groupDto).group);
            }
            else {
              resolve(new Error(msg));
            }
          });
      }
      catch (error: any) {
        console.log(error)
        resolve(error);
      }
    })
  }

  const getGroupRow = async (rootId: string, groupKey: IGroupKey, hidrate: boolean = false, includeAnswerId: string | null = null): Promise<any> => {
    const { partitionKey, id } = groupKey;
    console.log({ groupKey, includeAnswerId })
    return new Promise(async (resolve) => {
      try {
        const url = `${protectedResources.KnowledgeAPI.endpointGroupRow}/${partitionKey}/${id}/${hidrate}/${PAGE_SIZE}/${includeAnswerId}`;
        console.time()
        await Execute("GET", url)
          .then((groupRowDtoEx: IGroupRowDtoEx) => {
            console.timeEnd();
            const { groupRowDto, msg } = groupRowDtoEx;
            if (groupRowDto) {
              groupRowDto.RootId = rootId;
              resolve(new GroupRow(groupRowDto).groupRow);
            }
            else {
              resolve(new Error(msg));
            }
          });
      }
      catch (error: any) {
        console.log(error)
        resolve(error);
      }
    })
  }

  const expandGroup = useCallback(
    async ({ rootId, groupKey, formMode, includeAnswerId, newGroupRow, newAnswer }: IExpandInfo): Promise<any> => {
      try {
        dispatch({ type: ActionTypes.SET_ROW_EXPANDING, payload: {} });
        const { keyExpanded: groupKeyExpanded } = state;
        const { answerId } = groupKeyExpanded!;
        const groupRow: IGroupRow | Error = await getGroupRow(rootId, groupKey, true, includeAnswerId ?? null); // to reload Group
        if (groupRow instanceof Error) {
          dispatch({ type: ActionTypes.SET_ERROR, payload: { error: groupRow } });
          console.error({ cat: groupRow })
        }
        else {
          console.log('getGroup vratio:', groupRow)
          if (newGroupRow) {
            groupRow.groupRows = [newGroupRow, ...groupRow.groupRows];
          }

          if (newAnswer) {
            groupRow.answerRows = [newAnswer, ...groupRow.answerRows];
          }
          groupRow.isExpanded = true;
          //q.isSelected = q.id === answerId

          dispatch({ type: ActionTypes.SET_ROW_EXPANDED, payload: { groupRow, formMode: formMode! } });
          return groupRow;
        }
      }
      catch (error: any) {
        console.log('error', error);
        dispatch({ type: ActionTypes.SET_ERROR, payload: { error } });
        return null;
      }
    }, [dispatch]);


  const collapseGroup = useCallback(
    async (groupRow: IGroupRow) => {
      const { rootId } = groupRow;
      const groupKey = new GroupKey(groupRow).groupKey!;
      try {
        dispatch({ type: ActionTypes.SET_ROW_COLLAPSING, payload: {} });
        const groupRow: IGroupRow | Error = await getGroupRow(rootId!, groupKey); // no subGroupRows and no answerRows
        // .then(async (group: IGroup) => {
        if (groupRow instanceof Error) {
          dispatch({ type: ActionTypes.SET_ERROR, payload: { error: groupRow } });
          console.error({ cat: groupRow })
        }
        else {
          groupRow.rootId = rootId;
          groupRow.isExpanded = false;
          dispatch({ type: ActionTypes.SET_ROW_COLLAPSED, payload: { groupRow } });
          return groupKey;
        }
      }
      catch (error: any) {
        console.log('error', error);
        dispatch({ type: ActionTypes.SET_ERROR, payload: { error } });
      }
    }, [dispatch]);


  const addSubGroup = useCallback(
    async (groupRow: IGroupRow) => {
      try {
        const { rootId, topId: partitionKey, id, level, isExpanded, groupRows } = groupRow;
        const groupKey: IGroupKey = { partitionKey, id };
        const newGroupRow: IGroupRow = {
          ...initialGroup,
          rootId,
          topId: 'newGroupId',
          id: 'newGroupId', // backEnd will generate id
          parentId: id,
          level,
          title: 'new Group'
        }
        const expandInfo: IExpandInfo = {
          rootId: rootId!,
          groupKey,
          formMode: FormMode.AddingGroup,
          newGroupRow
        }
        if (isExpanded) {
          groupRows.map(g => g.isExpanded = false);
          const groupRow2: IGroupRow = { ...groupRow, groupRows: [newGroupRow, ...groupRows] };
          dispatch({ type: ActionTypes.SET_GROUP, payload: { groupRow: { ...newGroupRow, doc1: '' } } });
        }
        else {
          const row: IGroupRow | null = await expandGroup(expandInfo);
          if (row) {
            const group: IGroup = {
              ...newGroupRow, // TODO ili row koja je razlika
              doc1: ''
            }
            dispatch({ type: ActionTypes.SET_GROUP, payload: { groupRow: group } });
          }
        }
      }
      catch (error: any) {
        console.log('error', error);
        dispatch({ type: ActionTypes.SET_ERROR, payload: { error } });
      }
    }, [dispatch]);


  const cancelAddGroup = useCallback(
    async () => {
      try {
        const { rootId, topId: partitionKey, parentId } = activeGroup!;
        const groupKey: IGroupKey = { partitionKey, id: parentId };

        const expandInfo: IExpandInfo = {
          rootId: rootId!,
          groupKey,
          formMode: FormMode.None
        }
        const groupRow: IGroupRow | null = await expandGroup(expandInfo);
        if (groupRow) {
          dispatch({ type: ActionTypes.CANCEL_ADD_SUB_GROUP, payload: { groupRow } });
        }
      }
      catch (error: any) {
        console.log('error', error);
        dispatch({ type: ActionTypes.SET_ERROR, payload: { error } });
      }
    }, [dispatch, activeGroup]);


  const createGroup = useCallback(
    async (group: IGroup) => {
      const { topId: partitionKey, id, parentId, variations, title, kind, modified, rootId } = group;
      dispatch({ type: ActionTypes.SET_LOADING_GROUP, payload: {} });
      try {
        const groupDto = new GroupDto(group).groupDto;
        console.log("groupDto", { groupDto })
        const url = `${protectedResources.KnowledgeAPI.endpointGroup}`;
        console.time()
        await Execute("POST", url, groupDto, id)
          .then(async (groupDtoEx: IGroupDtoEx) => {   //  | null
            console.timeEnd();
            const { groupDto } = groupDtoEx;
            if (groupDto) {
              groupDto.RootId = rootId!;
              const group = new Group(groupDto).group;
              console.log('Group successfully created', { group })
              await loadAndCacheAllGroupRows()
                .then(async (done: boolean) => {
                  const parentGroupKey: IGroupKey = { partitionKey: parentId, id: parentId };
                  const expandInfo: IExpandInfo = {
                    rootId: rootId!,
                    groupKey: parentGroupKey,
                    formMode: FormMode.EditingGroup
                  }
                  await expandGroup(expandInfo).then(() => {
                    //dispatch({ type: ActionTypes.SET_GROUP, payload: { groupRow: group } }); // IGroup extends IGroup Row
                    dispatch({ type: ActionTypes.SET_GROUP_ADDED, payload: { groupRow: group } }); // IGroup extends IGroup Row
                  });
                })
            }
          });
      }
      catch (error: any) {
        console.log(error)
        dispatch({ type: ActionTypes.SET_ERROR, payload: { error: new Error('Server Error'), whichRowId: id } });
      }
    }, [dispatch]);


  const viewGroup = useCallback(async (groupRow: IGroupRow, includeAnswerId: string | null) => {
    if (formMode === FormMode.AddingAnswer) {
      await cancelAddAnswer();
    }
    else if (formMode === FormMode.AddingGroup) {
      await cancelAddGroup();
    }
    dispatch({ type: ActionTypes.SET_LOADING_GROUP, payload: {} });
    const groupKey = new GroupKey(groupRow).groupKey!;
    const group: IGroup = await getGroup(groupKey, includeAnswerId);
    if (group instanceof Error)
      dispatch({ type: ActionTypes.SET_ERROR, payload: { error: group } });
    else {
      group.rootId = groupRow.rootId;
      dispatch({ type: ActionTypes.SET_GROUP_TO_VIEW, payload: { groupRow: group } });
    }
  }, [dispatch, formMode]);


  const editGroup = useCallback(async (groupRow: IGroupRow, includeAnswerId: string | null) => {
    const { rootId, topId: partitionKey, parentId } = groupRow;
    if (formMode === FormMode.AddingAnswer) {
      await cancelAddAnswer();
    }
    else if (formMode === FormMode.AddingGroup) {
      await cancelAddGroup();
    }
    dispatch({ type: ActionTypes.SET_LOADING_GROUP, payload: {} });
    const groupKey = new GroupKey(groupRow).groupKey!;
    const group: IGroup = await getGroup(groupKey, includeAnswerId);
    if (group instanceof Error) {
      dispatch({ type: ActionTypes.SET_ERROR, payload: { error: group } });
    }
    else {
      if (parentId === null) { // topRow
        group.rootId = groupRow.rootId;
        dispatch({ type: ActionTypes.SET_GROUP_TO_EDIT, payload: { groupRow: group } });
      }
      else {
        const parentGroupKey = { partitionKey: parentId, id: parentId }
        // get acurate info from server (children will be collapsed)
        const expandInfo: IExpandInfo = {
          rootId: rootId!,
          groupKey: parentGroupKey,
          formMode: FormMode.EditingGroup
        }
        await expandGroup(expandInfo).then(() => {
          group.rootId = groupRow.rootId;
          dispatch({ type: ActionTypes.SET_GROUP_TO_EDIT, payload: { groupRow: group } });
        })
      }
    }
  }, [dispatch, formMode]);


  const updateGroup = useCallback(
    async (group: IGroup, closeForm: boolean) => {
      const { topId: partitionKey, id, variations, title, kind, modified, rootId } = group;
      dispatch({ type: ActionTypes.SET_LOADING_GROUP, payload: {} });
      try {
        const groupDto = new GroupDto(group).groupDto;
        const url = protectedResources.KnowledgeAPI.endpointGroup;
        console.time()
        await Execute("PUT", url, groupDto)
          .then((response: IGroupDtoEx | Response) => {
            console.timeEnd();
            if (response instanceof Response) {
              console.error(response);
              dispatch({ type: ActionTypes.SET_ERROR, payload: { error: new Error('Server Error') } });
            }
            else {
              const { groupDto, msg } = response as IGroupDtoEx;
              if (groupDto) {
                const group = new Group(groupDto).group;
                group.isExpanded = false;
                group.rootId = rootId;
                // modify tree and rest of state in single action
                dispatch({ type: ActionTypes.SET_GROUP_UPDATED, payload: { groupRow: group } });
                if (closeForm) {
                  //dispatch({ type: ActionTypes.CLOSE_GROUP_FORM, payload: {} })
                }
              }
              else {
                dispatch({ type: ActionTypes.SET_ERROR, payload: { error: new Error(`Group ${id} not found!`) } });
              }
            }
          });
      }
      catch (error: any) {
        console.log(error)
        return error;
      }
    }, [dispatch]);


  const deleteGroup = useCallback(async (groupRow: IGroupRow) => {
    dispatch({ type: ActionTypes.SET_LOADING_GROUP, payload: {} });
    try {
      const { topId: partitionKey, id, parentId, rootId } = groupRow;
      const parentGroupKey: IGroupKey = { partitionKey: parentId, id: parentId };
      const groupDto = new GroupRowDto(groupRow).groupRowDto;
      const url = protectedResources.KnowledgeAPI.endpointGroup;
      console.time()
      await Execute("DELETE", url, groupDto)    //Modified: {  Time: new Date(), NickName: globalState.authUser.nickName }
        .then(async (response: IGroupDtoEx | Response) => {
          console.timeEnd();
          if (response instanceof Response) {
            console.error({ response });
            if (response.status == 404) {
              dispatch({ type: ActionTypes.SET_ERROR, payload: { error: new Error('Group Not Found'), whichRowId: id } });
            }
          }
          else {
            const { groupDto, msg } = response as IGroupDtoEx;
            if (msg === "OK") {
              // await loadAndCacheAllGroupRows(); // reload
              console.log('Group successfully deleted', { groupRow })
              await loadAndCacheAllGroupRows()
                .then(async (done: boolean) => {
                  const expandInfo: IExpandInfo = {
                    rootId: rootId!,
                    groupKey: parentGroupKey,
                    formMode: FormMode.None
                  }
                  await expandGroup(expandInfo).then(() => {
                    // dispatch({ type: ActionTypes.DELETE_GROUP, payload: { id: groupDto!.Id } });
                    // dispatch({ type: ActionTypes.SET_GROUP, payload: { groupRow: group } }); // IGroup extends IGroup Row
                  });
                })
            }
            else if (msg === "HasSubGroups") {
              dispatch({ type: ActionTypes.SET_ERROR, payload: { error: new Error("First remove sub groups"), whichRowId: groupDto!.Id } });
            }
            else if (msg === "HasAnswers") {
              dispatch({ type: ActionTypes.SET_ERROR, payload: { error: new Error("First remove group answers"), whichRowId: groupDto!.Id } });
            }
            else {
              dispatch({ type: ActionTypes.SET_ERROR, payload: { error: new Error(msg), whichRowId: groupDto!.Id } });
            }
          }
        })
    }
    catch (error: any) {
      console.log(error)
      return error;
    }
  }, [dispatch]);


  const deleteGroupVariation = async (groupKey: IGroupKey, variationName: string) => {
    try {
      // const group = await dbp!.get('Groups', id);
      // const obj: IGroup = {
      //   ...group,
      //   variations: group.variations.filter((variation: string) => variation !== variationName),
      //   modified: {
      //     Time: new Date(),
      //     by: {
      //       nickName: globalState.authUser.nickName
      //     }
      //   }
      // }
      // POPRAVI TODO
      //updateGroup(obj, false);
      console.log("Group Tag successfully deleted");
    }
    catch (error: any) {
      console.log('error', error);
      dispatch({ type: ActionTypes.SET_ERROR, payload: { error } });
    }
  };


  ////////////////////////////////////
  // Answers
  //

  const PAGE_SIZE = 12;
  const loadGroupAnswers = useCallback(async ({ groupKey, startCursor, includeAnswerId }: ILoadGroupAnswers): Promise<any> => {
    try {
      const { partitionKey, id } = groupKey;
      dispatch({ type: ActionTypes.SET_GROUP_ANSWERS_LOADING, payload: { answerLoading: true } })
      try {
        const url = `${protectedResources.KnowledgeAPI.endpointAnswer}/${partitionKey}/${id}/${startCursor}/${PAGE_SIZE}/${includeAnswerId}`;
        console.time()
        console.log('>>>>>>>>>>>>loadGroupAnswers URL:', { url }, { includeAnswerId })
        await Execute!("GET", url).then((groupDtoEx: IGroupDtoEx) => {
          console.timeEnd();
          const { groupDto, msg } = groupDtoEx;
          console.log('>>>>>>>>>>>>loadGroupAnswers groupDto:', { groupDto })
          if (groupDto !== null) {
            const group = new Group(groupDto).group;
            // const { Title, AnswerRowDtos, HasMoreAnswers } = groupDto;
            // AnswerRowDtos!.forEach((answerRowDto: IAnswerRowDto) => {
            //   if (includeAnswerId && answerRowDto.Id === includeAnswerId) {
            //     answerRowDto.Included = true;
            //   }
            //   answerRowDto.GroupTitle = Title; // TODO treba li
            //   answerRowDtos.push(answerRowDto);
            // })
            // const answerRows: IAnswerRow[] = answerRowDtos.map(dto => new AnswerRow(dto).answerRow);
            // dispatch({
            //   type: ActionTypes.GROUP_ANSWERS_LOADED,
            //   payload: { id, answerRows, hasMoreAnswers: HasMoreAnswers! }
            // });
            dispatch({
              type: ActionTypes.GROUP_ANSWERS_LOADED,
              payload: { groupRow: group }
            });
          }
        });
      }
      catch (error: any) {
        console.log(error)
        dispatch({ type: ActionTypes.SET_ERROR, payload: { error } });
      }
    }
    catch (error: any) {
      console.log(error);
      dispatch({ type: ActionTypes.SET_ERROR, payload: error });
    }
  }, [dispatch]);


  const addAnswer = useCallback(
    async (groupKey: IGroupKey, rootId: string) => {
      try {
        //const { rootId, partitionKey, id, answerRows } = groupRow;
        //const groupKey: IGroupKey = {partitionKey, id};
        const { partitionKey, id } = groupKey;
        const cat: IGroupRow | undefined = await globalGetGroupRow(id!);
        const newAnswer: IAnswerRow = {
          ...initialAnswer,
          rootId,
          id: 'generateId', // backEnd will generate id
          title: 'new Answer',
          topId: id ?? '',
          parentId: id
        }

        const expandInfo: IExpandInfo = {
          rootId,
          groupKey,
          formMode: FormMode.AddingAnswer,
          newGroupRow: undefined,
          newAnswer
        }
        const groupRow: IGroupRow | null = await expandGroup(expandInfo);
        if (groupRow) {
          const answer: IAnswer = {
            ...newAnswer,
            groupTitle: cat ? cat.title : 'Jok Parent Title',
            source: 0,
            status: 0
          }
          dispatch({ type: ActionTypes.SET_ANSWER, payload: { answer, formMode: FormMode.AddingAnswer } });
        }
      }
      catch (error: any) {
        console.log('error', error);
        dispatch({ type: ActionTypes.SET_ERROR, payload: { error } });
      }
    }, [dispatch]);

  const cancelAddAnswer = useCallback(
    async () => {
      try {
        const { rootId, topId: partitionKey, parentId } = activeAnswer!;
        const groupKey: IGroupKey = { partitionKey, id: parentId };
        const expandInfo: IExpandInfo = {
          rootId,
          groupKey,
          formMode: FormMode.None
        }
        const groupRow: IGroupRow | null = await expandGroup(expandInfo);
        if (groupRow) {
          dispatch({ type: ActionTypes.CANCEL_ADD_ANSWER, payload: { groupRow } });
        }
      }
      catch (error: any) {
        console.log('error', error);
        dispatch({ type: ActionTypes.SET_ERROR, payload: { error } });
      }
    }, [dispatch, activeAnswer]);


  const createAnswer = useCallback(
    async (answer: IAnswer) => {
      const { topId: partitionKey, id, title, modified, parentId, rootId } = answer;
      // TODO
      dispatch({ type: ActionTypes.SET_LOADING_ANSWER, payload: {} });
      try {
        answer.created!.nickName = nickName;
        const answerDto = new AnswerDto(answer).answerDto;
        const url = `${protectedResources.KnowledgeAPI.endpointAnswer}`;
        console.time()
        console.log('>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>> createAnswer', answerDto)
        await Execute("POST", url, answerDto)
          .then(async (answerDtoEx: IAnswerDtoEx | null) => {
            console.timeEnd();
            if (answerDtoEx) {
              console.log("::::::::::::::::::::", { answerDtoEx });
              const { answerDto } = answerDtoEx;
              if (answerDto) {
                const answer = new Answer(answerDto).answer;
                answer.rootId = rootId;
                console.log('Answer successfully created')
                //dispatch({ type: ActionTypes.CLOSE_ANSWER_FORM })
                await loadAndCacheAllGroupRows() // numOfAnswers changed
                  .then(async (done: boolean) => {
                    const parentGroupKey: IGroupKey = { partitionKey: parentId, id: parentId };
                    const expandInfo: IExpandInfo = {
                      rootId,
                      groupKey: parentGroupKey,
                      formMode: FormMode.EditingAnswer
                    }
                    await expandGroup(expandInfo).then(() => {
                      dispatch({ type: ActionTypes.SET_ANSWER, payload: { formMode: FormMode.EditingAnswer, answer } });
                    });
                  })
              }
            }
          });
      }
      catch (error: any) {
        console.log(error)
        dispatch({ type: ActionTypes.SET_ERROR, payload: { error: new Error('Server Error'), whichRowId: id } });
      }
    }, [dispatch]);


  const updateAnswer = useCallback(
    async (rootId: string, oldParentGroup: string, newAnswer: IAnswer, groupChanged: boolean) => {
      const { topId: partitionKey, id, title, modified, parentId } = newAnswer;
      dispatch({ type: ActionTypes.SET_LOADING_ANSWER, payload: {} });
      try {
        newAnswer.modified!.nickName = nickName;
        const answerDto = new AnswerDto(newAnswer).answerDto;
        const url = `${protectedResources.KnowledgeAPI.endpointAnswer}`;
        console.time()
        answerDto.oldParentGroup = oldParentGroup;
        console.log('>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>> updateAnswer', answerDto)
        let answerRet: IAnswer | null = null;
        await Execute("PUT", url, answerDto)
          .then(async (answerDtoEx: IAnswerDtoEx) => {
            console.timeEnd();
            const { answerDto, msg } = answerDtoEx;
            if (answerDto) {
              answerRet = new Answer(answerDto).answer!;
              console.log('Answer successfully updated: ', answerRet)
              const { topId: partitionKey, parentId } = answerRet;
              if (groupChanged) {
                // nema koristi
                // dispatch({ type: ActionTypes.SET_ANSWER, payload: { answer: answerRet } })
                const { topId: partitionKey, parentId, id } = answerRet;
                const keyExpanded: IGroupKeyExpanded = {
                  partitionKey,
                  id: parentId,
                  answerId: id // keep the same answer
                }
                dispatch({ type: ActionTypes.FORCE_OPEN_NODE, payload: { keyExpanded } })
              }
              else {
                const parentGroupKey: IGroupKey = { partitionKey: parentId, id: parentId };
                const expandInfo: IExpandInfo = {
                  rootId,
                  groupKey: parentGroupKey,
                  formMode: FormMode.EditingAnswer
                }
                await expandGroup(expandInfo).then(() => {
                  dispatch({ type: ActionTypes.SET_ANSWER, payload: { formMode: FormMode.EditingAnswer, answer: answerRet! } });
                });
              }
            }
            else {
              dispatch({ type: ActionTypes.SET_ERROR, payload: { error: new Error(msg) } });
            }
          });
        return answerRet;
      }
      catch (error: any) {
        console.log(error)
        dispatch({ type: ActionTypes.SET_ERROR, payload: { error: new Error('Server Error'), whichRowId: id } });
      }
    }, [dispatch]);


  const deleteAnswer = useCallback(
    async (answerRow: IAnswerRow) => {
      const { topId: partitionKey, id, title, modified, parentId, rootId } = answerRow;
      dispatch({ type: ActionTypes.SET_LOADING_ANSWER, payload: {} });
      try {
        const answerDto = new AnswerRowDto(answerRow).answerRowDto;
        const url = `${protectedResources.KnowledgeAPI.endpointAnswer}`;
        console.time()
        await Execute("DELETE", url, answerDto)
          .then(async (answerDtoEx: IAnswerDtoEx) => {
            const { answerDto, msg } = answerDtoEx;
            console.timeEnd();
            if (answerDto) {
              const answer = new Answer(answerDto).answer;
              console.log('Answer successfully deleted')
              dispatch({ type: ActionTypes.DELETE_ANSWER, payload: { answer } });
              /*
              //dispatch({ type: ActionTypes.CLOSE_ANSWER_FORM })
              await loadAndCacheAllGroupRows(); // reload
              */
              const parentGroupKey: IGroupKey = { partitionKey: parentId, id: parentId };
              const expandInfo: IExpandInfo = {
                rootId,
                groupKey: parentGroupKey,
                formMode: FormMode.None
              }
              await expandGroup(expandInfo).then(() => {
                // dispatch({ type: ActionTypes.SET_GROUP, payload: { groupRow: group } }); // IGroup extends IGroup Row
              })
            }
            else {
              console.error(answerDtoEx);
              dispatch({ type: ActionTypes.SET_ERROR, payload: { error: new Error('Server Error'), whichRowId: id } });
            }
          });
      }
      catch (error: any) {
        console.log(error)
        dispatch({ type: ActionTypes.SET_ERROR, payload: { error: new Error('Server Error'), whichRowId: id } });
      }
    }, [dispatch]);


  const getAnswer = async (answerKey: IAnswerKey): Promise<any> => {
    return new Promise(async (resolve) => {
      try {
        const { partitionKey, id } = answerKey;
        const url = `${protectedResources.KnowledgeAPI.endpointAnswer}/${partitionKey}/${id}`;
        console.time()
        await Execute("GET", url)
          .then((answerDtoEx: IAnswerDtoEx) => {
            console.timeEnd();
            const { answerDto, msg } = answerDtoEx;
            if (answerDto) {
              const answerEx: IAnswerEx = {
                answer: new Answer(answerDto).answer,
                msg
              }
              resolve(answerEx);
            }
            else {
              const answerEx: IAnswerEx = {
                answer: null,
                msg
              }
              resolve(answerEx);
            }
            //}
          });
      }
      catch (error: any) {
        console.log(error);
        const answerEx: IAnswerEx = {
          answer: null,
          msg: "Problemos"
        }
        resolve(answerEx);
      }
    })
  }

  const viewAnswer = useCallback(async (answerRow: IAnswerRow) => {
    const answerKey = new AnswerKey(answerRow).answerKey;
    const answerEx: IAnswerEx = await getAnswer(answerKey!);
    if (formMode === FormMode.AddingAnswer) {
      await cancelAddAnswer();
    }
    else if (formMode === FormMode.AddingGroup) {
      await cancelAddGroup();
    }
    const { answer, msg } = answerEx;
    if (answer) {
      answer.rootId = answerRow.rootId;
      dispatch({ type: ActionTypes.SET_ANSWER_TO_VIEW, payload: { answer } });
    }
    else
      dispatch({ type: ActionTypes.SET_ERROR, payload: { error: new Error(msg) } });
  }, []);


  const editAnswer = useCallback(async (answerRow: IAnswerRow) => {
    const { topId: partitionKey, id, parentId, rootId } = answerRow;
    const answerKey: IAnswerKey = { partitionKey, id };
    if (formMode === FormMode.AddingAnswer) {
      await cancelAddAnswer();
    }
    else if (formMode === FormMode.AddingGroup) {
      await cancelAddGroup();
    }
    //dispatch({ type: ActionTypes.SET_VIEWING_EDITING_ANSWER });
    const answerEx: IAnswerEx = await getAnswer(answerKey!);
    const { answer, msg } = answerEx;
    if (answer) {
      // we don't reload groupRows, just use isSelected from activeAnswer
      answer.rootId = answerRow.rootId;
      dispatch({ type: ActionTypes.SET_ANSWER_TO_EDIT, payload: { answer } });
    }
    else
      dispatch({ type: ActionTypes.SET_ERROR, payload: { error: new Error(msg) } });
  }, []);

  const contextValue: IGroupsContext = {
    state, openNode, loadTopGroupRows,
    addSubGroup, cancelAddGroup, createGroup,
    viewGroup, editGroup, updateGroup, deleteGroup, deleteGroupVariation,
    expandGroup, collapseGroup,
    loadGroupAnswers,
    addAnswer, cancelAddAnswer, createAnswer,
    viewAnswer, editAnswer, updateAnswer, deleteAnswer
  }
  return (
    <GroupsContext.Provider value={contextValue}>
      <GroupDispatchContext.Provider value={dispatch}>
        {children}
      </GroupDispatchContext.Provider>
    </GroupsContext.Provider>
  );
}

export function useGroupContext() {
  return useContext(GroupsContext);
}

export const useGroupDispatch = () => {
  return useContext(GroupDispatchContext)
};

