import { useGlobalState, useGlobalContext } from 'global/GlobalProvider'
import React, { createContext, useContext, useReducer, useCallback, Dispatch } from 'react';

import {
  ActionTypes, IGroup, IAnswer, IGroupsContext,
  IGroupDto, IGroupDtoEx, IGroupDtoListEx, IGroupKey, IGroupKeyExtended, IGroupKeyExpanded,
  GroupKey, Group, GroupDto,
  IAnswerDto, IAnswerDtoEx, IAnswerEx, IAnswerRowDto, IAnswerKey, IAnswerRow,
  Answer, AnswerDto, AnswerRow,
  AnswerRowDto,
  IParentInfo
} from 'groups/types';

import { initialGroupsState, GroupsReducer } from 'groups/GroupsReducer';
import { IWhoWhen, Dto2WhoWhen, WhoWhen2Dto, IShortGroup } from 'global/types';
import { protectedResources } from 'authConfig';

const GroupsContext = createContext<IGroupsContext>({} as any);
const GroupDispatchContext = createContext<Dispatch<any>>(() => null);

type Props = {
  children: React.ReactNode
}

export const GroupProvider: React.FC<Props> = ({ children }) => {

  const { loadShortGroups, setNodesReloaded } = useGlobalContext()
  const globalState = useGlobalState();
  const { dbp, shortGroups } = globalState;

  const [state, dispatch] = useReducer(GroupsReducer, initialGroupsState);
  const { groupNodesUpTheTree } = state;
  console.log('----->>> GroupProvider', { initialGroupsState, groupNodesUpTheTree })


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

  const reloadGroupNode = useCallback(
    async (groupKeyExpanded: IGroupKeyExpanded, fromChatBotDlg: string = 'false'): Promise<any> => {
      return new Promise(async (resolve) => {
        try {
          console.log('---GroupProvider.reloadGroupNode groupKeyExpanded:', groupKeyExpanded)
          const { id, partitionKey } = groupKeyExpanded;
          if (id) {
            const shortGroup: IShortGroup | undefined = shortGroups.get(id);
            if (shortGroup) {
              groupKeyExpanded.partitionKey = shortGroup.partitionKey;
            }
            else {
              alert('reload goups' + id)
              //return
            }
          }
          //dispatch({ type: ActionTypes.GROUP_NODE_LOADING, payload: { loading: true } })
          //dispatch({ type: ActionTypes.CLEAN_SUB_TREE, payload: { groupKey: null/*new GroupKey(parentCat).groupKey*/ } });
          // ---------------------------------------------------------------------------
          console.time();

          //const query = groupKey ? `${groupKey.partitionKey}/${groupKey.id}` : 'null/null';
          //const query = `${partitionKey}/${id}`;
          const url = `${protectedResources.KnowledgeAPI.endpointShortGroup}/${partitionKey}/${id}`;
          console.log('calling ShortGroupController.GetGroupsUpTheTree', url)
          await Execute("GET", url)
            .then((groupDtoListEx: IGroupDtoListEx) => {
              //dispatch({ type: ActionTypes.CLEAN_SUB_TREE, payload: { groupKey: groupKey! } });
              const { groupDtoList, msg } = groupDtoListEx;
              console.timeEnd();
              const groupNodesUpTheTree = groupDtoList.map((groupDto: IGroupDto) => {
                const { PartitionKey, Id, Title } = groupDto;
                return { partitionKey: PartitionKey, id: Id, title: Title } as IGroupKeyExtended
              })
              dispatch({
                type: ActionTypes.SET_GROUP_NODES_UP_THE_TREE, payload: {
                  groupKeyExpanded,
                  groupNodesUpTheTree,
                  fromChatBotDlg: fromChatBotDlg === 'true'
                }
              })
              resolve(true)
            });
        }
        catch (error: any) {
          console.log(error)
          dispatch({ type: ActionTypes.SET_ERROR, payload: { error } });
        }
      })
    }, [dispatch]);


  const getSubGroups = useCallback(async (groupKey: IGroupKey) => {
    return new Promise(async (resolve) => {
      const { partitionKey, id } = groupKey;
      try {
        dispatch({ type: ActionTypes.SET_LOADING });
        const url = `${protectedResources.KnowledgeAPI.endpointGroup}/${partitionKey}/${id}`;
        console.log('GroupProvider getSubGroups url:', url)
        console.time();
        await Execute("GET", url).then((groupDtos: IGroupDto[]) => {
          console.timeEnd();
          const subGroups = groupDtos!.map((groupDto: IGroupDto) => new Group(groupDto).group);
          dispatch({ type: ActionTypes.SET_SUB_GROUPS, payload: { subGroups } });
          setTimeout(() => setNodesReloaded(), 5000); // TODO actually when last node has been loaded
          resolve(true);
        });
      }
      catch (error: any) {
        console.log(error)
        dispatch({ type: ActionTypes.SET_ERROR, payload: { error } });
      }
    })
  }, [dispatch]);


  const createGroup = useCallback(
    async (group: IGroup) => {
      const { partitionKey, id, variations, title, kind, modified } = group;
      dispatch({ type: ActionTypes.SET_GROUP_LOADING, payload: { id, loading: false } });
      try {
        const groupDto = new GroupDto(group).groupDto;
        console.log("groupDto", { groupDto })
        const url = `${protectedResources.KnowledgeAPI.endpointGroup}`;
        console.time()
        await Execute("POST", url, groupDto, id)
          .then(async (groupDtoEx: IGroupDtoEx | null) => {
            console.timeEnd();
            if (groupDtoEx) {
              const { groupDto } = groupDtoEx;
              if (groupDto) {
                const group = new Group(groupDto).group;
                console.log('Group successfully created')
                dispatch({ type: ActionTypes.SET_ADDED_GROUP, payload: { group: { ...group, answerRows: [] } } });
                dispatch({ type: ActionTypes.CLOSE_GROUP_FORM })
                await loadShortGroups(); // reload
              }
            }
          });
      }
      catch (error: any) {
        console.log(error)
        dispatch({ type: ActionTypes.SET_ERROR, payload: { error: new Error('Server Error'), whichRowId: id } });
      }
    }, [dispatch]);


  const getGroup = async (groupKey: IGroupKey, includeAnswerId: string): Promise<any> => {
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

  const expandGroup = useCallback(
    async (groupKey: IGroupKey, includeAnswerId: string) => {
      try {
        const group: IGroup | Error = await getGroup(groupKey, includeAnswerId); // to reload Group
        // .then(async (group: IGroup) => {
        console.log('getGroup', { group })
        if (group instanceof Error) {
          dispatch({ type: ActionTypes.SET_ERROR, payload: { error: group } });
          console.error({ group })
        }
        else {
          console.log('vratio getGroup', group)
          group.isExpanded = true;
          //dispatch({ type: ActionTypes.SET_GROUP, payload: { group } });
          dispatch({ type: ActionTypes.SET_EXPANDED, payload: { groupKey } });
          return group;
        }
        //})
      }
      catch (error: any) {
        console.log('error', error);
        dispatch({ type: ActionTypes.SET_ERROR, payload: { error } });
      }
    }, [dispatch]);

  const collapseGroup = useCallback(
    async (groupKey: IGroupKey) => {
      try {
        //dispatch({ type: ActionTypes.CLEAN_SUB_TREE, payload: { groupKey } });// clean subTree
        dispatch({ type: ActionTypes.SET_COLLAPSED, payload: { groupKey } });
      }
      catch (error: any) {
        console.log('error', error);
        dispatch({ type: ActionTypes.SET_ERROR, payload: { error } });
      }
    }, [dispatch]);

  const viewGroup = useCallback(async (groupKey: IGroupKey, includeAnswerId: string) => {
    dispatch({ type: ActionTypes.SET_LOADING });
    const group = await getGroup(groupKey, includeAnswerId);
    if (group instanceof Error)
      dispatch({ type: ActionTypes.SET_ERROR, payload: { error: group } });
    else
      dispatch({ type: ActionTypes.VIEW_GROUP, payload: { group } });
  }, [dispatch]);


  const editGroup = useCallback(async (groupKey: IGroupKey, includeAnswerId: string) => {
    dispatch({ type: ActionTypes.SET_LOADING });
    const group = await getGroup(groupKey, includeAnswerId);
    if (group instanceof Error)
      dispatch({ type: ActionTypes.SET_ERROR, payload: { error: group } });
    else
      dispatch({ type: ActionTypes.EDIT_GROUP, payload: { group } });
  }, [dispatch]);


  const updateGroup = useCallback(
    async (group: IGroup, closeForm: boolean) => {
      const { partitionKey, id, variations, title, kind, modified } = group;
      dispatch({ type: ActionTypes.SET_GROUP_LOADING, payload: { id, loading: false } });
      try {
        const groupDto = new GroupDto(group).groupDto;

        const url = `${protectedResources.KnowledgeAPI.endpointGroup}`;
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
                const { id, partitionKey } = group;
                dispatch({ type: ActionTypes.CLEAN_SUB_TREE, payload: { groupKey: { partitionKey, id } } });
                dispatch({ type: ActionTypes.SET_GROUP, payload: { group } });
                if (closeForm) {
                  dispatch({ type: ActionTypes.CLOSE_GROUP_FORM })
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


  const deleteGroup = useCallback(async (group: IGroup) => {
    //dispatch({ type: ActionTypes.SET_GROUP_LOADING, payload: { id, loading: false } });
    try {
      const groupDto = new GroupDto(group).groupDto;
      const url = `${protectedResources.KnowledgeAPI.endpointGroup}` ///${groupKey.partitionKey}/${groupKey.id}`;
      console.time()
      await Execute("DELETE", url, groupDto)    //Modified: {  Time: new Date(), NickName: globalState.authUser.nickName }
        .then(async (response: IGroupDtoEx | Response) => {
          console.timeEnd();
          if (response instanceof Response) {
            console.error({ response });
            if (response.status == 404) {
              dispatch({ type: ActionTypes.SET_ERROR, payload: { error: new Error('Group Not Found'), whichRowId: group.id } });
            }
          }
          else {
            const { groupDto, msg } = response as IGroupDtoEx;
            if (msg == "OK") {
              dispatch({ type: ActionTypes.DELETE, payload: { id: groupDto!.Id } });
              await loadShortGroups(); // reload
            }
            else if (msg === "HasSubGroups") {
              dispatch({ type: ActionTypes.SET_ERROR, payload: { error: new Error("First remove sub groups"), whichRowId: groupDto!.Id } });
            }
            else if (msg === "NumOfAnswers") {
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
  const loadGroupAnswers = useCallback(
    async ({ groupKey, startCursor, includeAnswerId }: IParentInfo)
      : Promise<any> => {
      const answerRowDtos: IAnswerRowDto[] = [];
      try {
        const { partitionKey, id } = groupKey;
        dispatch({ type: ActionTypes.SET_GROUP_ANSWERS_LOADING, payload: { answerLoading: true } })
        try {
          const url = `${protectedResources.KnowledgeAPI.endpointAnswer}/${partitionKey}/${id}/${startCursor}/${PAGE_SIZE}/${includeAnswerId}`;
          console.time()
          console.log('>>>>>>>>>>>>')
          console.log('>>>>>>>>>>>>loadGroupAnswers URL:', { url }, { includeAnswerId })
          console.log('>>>>>>>>>>>>')
          await Execute!("GET", url).then((groupDtoEx: IGroupDtoEx) => {
            console.timeEnd();
            const { groupDto, msg } = groupDtoEx;
            console.log('>>>>>>>>>>>>loadGroupAnswers groupDto:', { groupDto })
            if (groupDto !== null) {
              const { Title, Answers: AnswerRowDtos, HasMoreAnswers } = groupDto;
              AnswerRowDtos!.forEach((answerRowDto: IAnswerRowDto) => {
                if (includeAnswerId && answerRowDto.Id === includeAnswerId) {
                  answerRowDto.Included = true;
                }
                answerRowDto.GroupTitle = Title; // TODO treba li
                answerRowDtos.push(answerRowDto);
              })
              const answerRows: IAnswerRow[] = answerRowDtos.map(dto => new AnswerRow(dto).answerRow);
              dispatch({
                type: ActionTypes.LOAD_GROUP_ANSWERS,
                payload: { id, answerRows, hasMoreAnswers: HasMoreAnswers! }
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


  const createAnswer = useCallback(
    async (answer: IAnswer) => {
      const { partitionKey, id, title, modified, parentGroup } = answer;
      dispatch({ type: ActionTypes.SET_GROUP_LOADING, payload: { id: parentGroup!, loading: false } });
      try {
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
                console.log('Answer successfully created')
                dispatch({ type: ActionTypes.SET_ANSWER, payload: { answer } });
                //dispatch({ type: ActionTypes.CLOSE_ANSWER_FORM })
                await loadShortGroups(); // reload
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
    async (answer: IAnswer, groupChanged: boolean) => {
      const { partitionKey, id, title, modified, parentGroup } = answer;
      // dispatch({ type: ActionTypes.SET_GROUP_LOADING, payload: { id: parentGroup!, loading: false } });
      try {
        const answerDto = new AnswerDto(answer).answerDto;
        const url = `${protectedResources.KnowledgeAPI.endpointAnswer}`;
        console.time()
        console.log('>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>> updateAnswer', answerDto)
        let answerRet = null;
        await Execute("PUT", url, answerDto)
          .then(async (answerDtoEx: IAnswerDtoEx) => {
            console.timeEnd();
            const { answerDto, msg } = answerDtoEx;
            if (answerDto) {
              answerRet = new Answer(answerDto).answer;
              console.log('Answer successfully updated: ', answerRet)
              const { partitionKey, parentGroup } = answerRet;
              if (groupChanged) {
                const catKeyExpanded: IGroupKeyExpanded = {
                  partitionKey,
                  id: parentGroup,
                  answerId: null // TODO zadrzi isti
                }
                dispatch({ type: ActionTypes.GROUP_NODE_RE_LOADING });
                dispatch({ type: ActionTypes.CLEAN_SUB_TREE, payload: { groupKey: null } });
                await reloadGroupNode(catKeyExpanded)
              }
              else {
                dispatch({ type: ActionTypes.SET_ANSWER, payload: { answer } });
              }
              //dispatch({ type: ActionTypes.CLOSE_ANSWER_FORM })
              // await loadCats(); // reload
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
      const { partitionKey, id, title, modified, parentGroup } = answerRow;
      dispatch({ type: ActionTypes.SET_GROUP_LOADING, payload: { id: parentGroup!, loading: false } });
      try {
        const answerDto = new AnswerRowDto(answerRow).answerRowDto;
        const url = `${protectedResources.KnowledgeAPI.endpointAnswer}`;
        console.time()
        await Execute("DELETE", url, answerDto)
          .then(async (response: IAnswerDtoEx | Response) => {
            console.timeEnd();
            if (response instanceof Response) {
              console.error(response);
              dispatch({ type: ActionTypes.SET_ERROR, payload: { error: new Error('Server Error'), whichRowId: id } });
            }
            else {
              const answerDtoEx: IAnswerDtoEx = response;
              const { answerDto, msg } = answerDtoEx;
              if (answerDto) {
                const answer = new Answer(answerDto).answer;
                console.log('Answer successfully deleted')
                dispatch({ type: ActionTypes.DELETE_ANSWER, payload: { answer } });
                //dispatch({ type: ActionTypes.CLOSE_ANSWER_FORM })
                await loadShortGroups(); // reload
              }
              else {
                dispatch({ type: ActionTypes.SET_ERROR, payload: { error: new Error(msg) } });
              }
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

  const viewAnswer = useCallback(async (answerKey: IAnswerKey) => {
    const answerEx: IAnswerEx = await getAnswer(answerKey);
    const { answer, msg } = answerEx;
    if (answer)
      dispatch({ type: ActionTypes.VIEW_ANSWER, payload: { answer } });
    else
      dispatch({ type: ActionTypes.SET_ERROR, payload: { error: new Error(msg) } });
  }, []);

  const editAnswer = useCallback(async (answerKey: IAnswerKey) => {
    //dispatch({ type: ActionTypes.SET_VIEWING_EDITING_ANSWER });
    const answerEx: IAnswerEx = await getAnswer(answerKey);
    const { answer, msg } = answerEx;
    if (answer)
      dispatch({ type: ActionTypes.EDIT_ANSWER, payload: { answer } });
    else
      dispatch({ type: ActionTypes.SET_ERROR, payload: { error: new Error(msg) } });
  }, []);



  const contextValue: IGroupsContext = {
    state, reloadGroupNode,
    getSubGroups, createGroup, viewGroup, editGroup, updateGroup, deleteGroup, deleteGroupVariation,
    expandGroup, collapseGroup,
    loadGroupAnswers, createAnswer, viewAnswer, editAnswer, updateAnswer, deleteAnswer
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

