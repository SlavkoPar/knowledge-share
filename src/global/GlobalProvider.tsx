import React, { createContext, useContext, useReducer, Dispatch, useCallback, useEffect } from "react";

import {
  IGlobalContext, ILoginUser, ROLES, GlobalActionTypes,
  ICategoryData, IQuestionData,
  IGroupData, IAnswerData,
  IRoleData, IUserData,
  IRegisterUser,
  IParentInfo,
  IWhoWhen,
  IHistory, IHistoryDtoEx, IHistoryData, HistoryDto,
  IHistoryDtoListEx,
  IHistoryListEx,
  IHistoryFilterDto,
  IAuthUser,
  IGlobalState,
} from 'global/types'

import { globalReducer, initialAuthUser } from "global/GlobalReducer";

import {
  Category, ICategory, ICategoryDto, ICategoryKey, IQuestionRow, IQuestionRowDto, IQuestionRowDtosEx,
  IQuestion, IQuestionDto, IQuestionDtoEx, IQuestionEx, IQuestionKey, Question, IAssignedAnswer,
  ICategoryRowDto, ICategoryRow, CategoryRow,
  QuestionKey
} from "categories/types";

import {
  Group, IGroup, IGroupDto, IGroupKey, IAnswer, IAnswerDto, IAnswerKey, IAnswerRow, IAnswerRowDto, IAnswerRowDtosEx, Answer,
  IGroupRow, IGroupRowDto, GroupRow
} from "groups/types";

import { IUser } from 'global/types';

import { IDBPDatabase, IDBPIndex, openDB } from 'idb' // IDBPTransaction
import { escapeRegexCharacters } from 'common/utilities'

//////////////////
// Initial data
import { protectedResources } from "authConfig";

const GlobalContext = createContext<IGlobalContext>({} as any);
const GlobalDispatchContext = createContext<Dispatch<any>>(() => null);

interface Props {
  children: React.ReactNode
}


const initGlobalState: IGlobalState = {
  dbp: null,
  workspace: 'unknown',
  authUser: initialAuthUser,
  isAuthenticated: false,
  everLoggedIn: true,
  canEdit: true,
  isOwner: true,
  isDarkMode: true,
  variant: 'dark',
  bg: 'dark',
  loading: false,
  allCategoryRows: new Map<string, ICategoryRow>(),
  allCategoryRowsLoaded: undefined,
  allGroupRows: new Map<string, IGroupRow>(),
  allGroupRowsLoaded: undefined,
  nodesReLoaded: false,
  lastRouteVisited: '/categories',
}

export const GlobalProvider: React.FC<Props> = ({ children }) => {
  // If we update globalState, form inner Provider, 
  // we reset changes, and again we use initialGlobalState
  // so, don't use globalDispatch inside of inner Provider, like Categories Provider
  const [globalState, dispatch] = useReducer(globalReducer, initGlobalState);
  const { workspace, authUser, allCategoryRows } = globalState;

  console.log('--------> GlobalProvider')


  useEffect(() => {
    // let initState: IGlobalState = {
    //   ...initGlobalState
    // }
    if ('localStorage' in window) {
      console.log('GLOBAL_STATE loaded before signIn')
      let s = localStorage.getItem('GLOBAL_STATE');
      if (s !== null) {
        const locStorage = JSON.parse(s);
        const { everLoggedIn, nickName, isDarkMode, variant, bg, lastRouteVisited } = locStorage;
        // initState = {
        //   ...initState,
        //   everLoggedIn,
        //   // authUser: {
        //   //   ...authUser,
        //   //   nickName
        //   // },
        //   isDarkMode,
        //   variant,
        //   bg,
        //   lastRouteVisited
        // }
        dispatch({ type: GlobalActionTypes.SET_FROM_LOCAL_STORAGE, payload: { locStorage } });
      }
    }

  }, []);

  const Execute = async (method: string, endpoint: string, data: Object | null = null): Promise<any> => {
    const accessToken = localStorage.getItem("accessToken");
    if (accessToken) {
      try {
        console.log({ accessToken })
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
              dispatch({ type: GlobalActionTypes.SET_ERROR, payload: { error: new Error(`Response status: ${response.status}`) } });
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
          dispatch({ type: GlobalActionTypes.SET_ERROR, payload: { error } });
        }
      }
      catch (e) {
        console.log('-------------->>> execute', method, endpoint, e)
        dispatch({ type: GlobalActionTypes.SET_ERROR, payload: { error: new Error(`fetch eror`) } });
      }
    }
    return null;
  }
  // }, [dispatch]);
  const getUser = async (nickName: string) => {
    try {
      const { dbp } = globalState;
      const user: IUser = await dbp!.get("Users", nickName);
      return user;
    }
    catch (error: any) {
      console.log(error);
      return undefined;
    }
  }



  // ---------------------------
  // load all categoryRows
  // ---------------------------
  const loadAndCacheAllCategoryRows = useCallback(async (): Promise<any> => {
    return new Promise(async (resolve) => {
      try {
        console.time();
        const url = `${protectedResources.KnowledgeAPI.endpointCategoryRow}/${workspace}`;
        await Execute("GET", url, null)
          .then((catRowDtos: ICategoryRowDto[]) => {   //  | Response
            const allCategoryRows = new Map<string, ICategoryRow>();
            console.timeEnd();
            catRowDtos.forEach((rowDto: ICategoryRowDto) => allCategoryRows.set(rowDto.Id, new CategoryRow(rowDto).categoryRow));
            allCategoryRows.forEach(cat => {
              let { id, parentId, title, variations, hasSubCategories, level, kind } = cat;
              let titlesUpTheTree = id;
              let parentCat = parentId;
              while (parentCat) {
                const cat2 = allCategoryRows.get(parentCat)!;
                titlesUpTheTree = cat2!.id + ' / ' + titlesUpTheTree;
                parentCat = cat2.parentId;
              }
              cat.titlesUpTheTree = titlesUpTheTree;
              allCategoryRows.set(id, cat);
            })
            dispatch({ type: GlobalActionTypes.SET_ALL_CATEGORY_ROWS, payload: { allCategoryRows } });
            resolve(true)
          });
      }
      catch (error: any) {
        console.log(error)
        dispatch({ type: GlobalActionTypes.SET_ERROR, payload: { error } });
      }
      resolve(true);
    });
  }, [dispatch, workspace]);


  // ---------------------------
  // load all groupRows
  // ---------------------------
  const loadAndCacheAllGroupRows = useCallback(async (): Promise<any> => {
    return new Promise(async (resolve) => {
      try {
        console.time();
        const url = `${protectedResources.KnowledgeAPI.endpointGroupRow}/${workspace}`;
        await Execute("GET", url, null)
          .then((rowDtos: IGroupRowDto[]) => {   //  | Response
            console.log('loadAndCacheAllGroupRows', protectedResources.KnowledgeAPI.endpointGroupRow)
            const allGroupRows = new Map<string, IGroupRow>();
            console.timeEnd();
            // if (groupDtos instanceof Response) {
            //   throw (groupDtos);
            // }
            //const data: IGroupDto[] = groupDtos;
            rowDtos.forEach((rowDto: IGroupRowDto) => allGroupRows.set(rowDto.Id, new GroupRow(rowDto).groupRow));
            //
            allGroupRows.forEach(groupRow => {
              let { topId: topId, id, parentId, title, variations, hasSubGroups, level, kind } = groupRow;
              let titlesUpTheTree = id;
              let parentGrp = parentId;
              while (parentGrp) {
                const groupRow2 = allGroupRows.get(parentGrp)!;
                titlesUpTheTree = groupRow2!.id + ' / ' + titlesUpTheTree;
                parentGrp = groupRow2.parentId;
              }
              groupRow.titlesUpTheTree = titlesUpTheTree;
              allGroupRows.set(id, groupRow);
            })
            dispatch({ type: GlobalActionTypes.SET_ALL_GROUP_ROWS, payload: { allGroupRows } });
            resolve(true)
          });
      }
      catch (error: any) {
        console.log(error)
        dispatch({ type: GlobalActionTypes.SET_ERROR, payload: { error } });
      }
      resolve(true);
    });
  }, [dispatch, workspace]);

  //const searchQuestions = useCallback(async (execute: (method: string, endpoint: string) => Promise<any>, filter: string, count: number): Promise<any> => {
  const searchQuestions = async (filter: string, count: number): Promise<any> => {
    return new Promise(async (resolve) => {
      try {
        console.time();
        const filterEncoded = encodeURIComponent(filter);
        const url = `${protectedResources.KnowledgeAPI.endpointQuestion}/${workspace}/${filterEncoded}/${count}/null`;
        await Execute("GET", url).then((dtosEx: IQuestionRowDtosEx) => {
          const { questionRowDtos, msg } = dtosEx;
          console.log('questionRowDtos:', { dtos: dtosEx }, protectedResources.KnowledgeAPI.endpointCategory);
          console.timeEnd();
          if (questionRowDtos) {
            const questionRows: IQuestionRow[] = questionRowDtos.map((dto: IQuestionRowDto) => {
              const { TopId, ParentId, Id, Title, NumOfAssignedAnswers, Included } = dto;
              return {
                topId: TopId,
                parentId: ParentId ?? '',
                id: Id,
                title: Title,
                categoryTitle: '',
                numOfAssignedAnswers: NumOfAssignedAnswers ?? 0,
                included: Included ?? false,
              }
            })
            // const list: IQuestionRow[] = dtos.map((q: IQuestionRowDto) => ({
            //   topId: q.PartitionKey,
            //   id: q.Id,
            //   parentId: q.ParentId,
            //   numOfAssignedAnswers: q.NumOfAssignedAnswers ?? 0,
            //   title: q.Title,
            //   categoryTitle: '',
            //   isSelected: q.Included !== undefined
            // }))
            resolve(questionRows);
          }
          else {
            // reject()
            console.log('no rows in search')
          }
        })
      }
      catch (error: any) {
        console.log(error)
        //dispatch({ type: GlobalActionTypes.SET_ERROR, payload: { error } });
      }
    });
  }
  //}, []);



  const getGroupRows = useCallback(async (groupId: string | null) => {
    const { allGroupRowsLoaded } = globalState;
    if (!allGroupRowsLoaded) {
      await loadAndCacheAllGroupRows();
    }
    try {
      const { allGroupRows: groupRows } = globalState;
      let parentHeader = "";
      console.log('globalState.groupRows', { groupRows }, groupId)
      const subGroupRows: IGroupRow[] = [];
      groupRows.forEach((groupRow, id) => {  // globalState.shortGroups is Map<string, IShortGroup>
        if (groupRow.id === groupId) {
          parentHeader = groupRow.header!;
        }
        else if (groupRow.parentId === groupId) {
          const { topId: topId, id, parentId, header, title, level, kind, hasSubGroups } = groupRow;
          const row: IGroupRow = {
            topId,
            id,
            header,
            title,
            parentId,
            titlesUpTheTree: "",
            hasSubGroups,
            level,
            kind,
            isExpanded: false,
            link: null,
            groupRows: [],
            variations: [],
            numOfAnswers: 0,
            answerRows: []
          }
          subGroupRows.push(row);
        }
      })
      return { subGroupRows, parentHeader };
    }
    catch (error: any) {
      console.log(error)
      dispatch({ type: GlobalActionTypes.SET_ERROR, payload: { error } });
      return { groupRows: [], parentHeader: 'Kiks' };
    }
  }, [globalState.allGroupRows]);


  const searchAnswers = async (filter: string, count: number): Promise<any> => {
    const { allGroupRows } = globalState;
    return new Promise(async (resolve) => {
      try {
        console.time();
        const filterEncoded = encodeURIComponent(filter);
        const url = `${protectedResources.KnowledgeAPI.endpointAnswer}/${workspace}/${filterEncoded}/${count}/nesto`;
        await Execute("GET", url).then((answerRowDtosEx: IAnswerRowDtosEx) => {
          const { answerRowDtos: dtos, msg } = answerRowDtosEx;
          console.log('ANSWERSSSSS', { answerRowDtos: dtos }, url);
          console.timeEnd();
          if (dtos) {
            const list: IAnswerRow[] = dtos.map((rowDto: IAnswerRowDto) => {
              const answer = new Answer(rowDto).answer;
              return answer;
              //const { PartitionKey, Id, ParentId, Title } = rowDto;
              // return {
              //   topId: PartitionKey,
              //   id: Id,
              //   parentId: ParentId,
              //   title: Title,
              //   groupTitle: ''
              // }
            })
            resolve(list);
          }
          else {
            // reject()
            console.log('no rows in search' + msg)
          }
        })
      }
      catch (error: any) {
        console.log(error)
        //dispatch({ type: GlobalActionTypes.SET_ERROR, payload: { error } });
      }
    });
  }

  const OpenDB = useCallback(async (): Promise<any> => {
    try {
      // await loadAndCacheAllCategoryRows();
      // await loadAndCacheAllGroupRows();
      //console.log('*** loadAndCacheAllCategoryRows')
      // return true;
    }
    catch (err: any) {
      console.log(err);
      dispatch({
        type: GlobalActionTypes.SET_ERROR,
        payload: {
          error: new Error("Greska Teska")
        }
      });
      return false;
    }
  }, []);

  // differs from CategoryProvider, here we don't dispatch
  const getQuestion = async (questionKey: IQuestionKey): Promise<any> => {

    return new Promise(async (resolve) => {
      try {
        const { topId, id } = questionKey;
        const query = new QuestionKey(questionKey).toQuery(workspace);
        const url = `${protectedResources.KnowledgeAPI.endpointQuestion}?${query}`;
        console.time()
        await Execute("GET", url)
          .then((questionDtoEx: IQuestionDtoEx) => {
            console.timeEnd();
            const { questionDto, msg } = questionDtoEx;
            if (questionDto) {
              const questionEx: IQuestionEx = {
                question: new Question(questionDto).question,
                msg
              }
              resolve(questionEx);
            }
            else {
              const questionEx: IQuestionEx = {
                question: null,
                msg
              }
              resolve(questionEx);
            }
            //}
          });
      }
      catch (error: any) {
        console.log(error);
        const questionEx: IQuestionEx = {
          question: null,
          msg: "Problemos"
        }
        resolve(questionEx);
      }
    })
  }

  const getCatsByKind = async (kind: number): Promise<ICategoryRow[]> => {
    try {
      const { allCategoryRows } = globalState;
      const categories: ICategoryRow[] = [];
      allCategoryRows.forEach((c, id) => {
        if (c.kind === kind) {
          const { topId, id, title, level, link, header } = c;
          // const cat: ICat = {
          //   topId,
          //   id: id,
          //   header,
          //   title,
          //   link,
          //   parentId: "",
          //   titlesUpTheTree: "",
          //   variations: [],
          //   hasSubCategories: false,
          //   numOfQuestions: 0,
          //   level,
          //   kind,
          //   isExpanded: false
          // }
          categories.push(c);
        }
      })
      return categories;
    }
    catch (error: any) {
      console.log(error)
      dispatch({ type: GlobalActionTypes.SET_ERROR, payload: { error } });
    }
    return [];
  }


  const getCatsByLevel = async (kind: number): Promise<ICategoryRow[]> => {
    try {
      const categories: ICategoryRow[] = [];
      allCategoryRows.forEach((c, id) => {
        if (c.kind === kind) {
          const { topId, id, header, title, link, level } = c;
          // const cat: ICategoryRow = {
          //   topId,
          //   id,
          //   header,
          //   title,
          //   link,
          //   parentId: "",
          //   titlesUpTheTree: "",
          //   variations: [],
          //   hasSubCategories: false,
          //   numOfQuestions: 0,
          //   level,
          //   kind,
          //   isExpanded: false
          // }
          categories.push(c);
        }
      })
      return categories;
    }
    catch (error: any) {
      console.log(error)
      dispatch({ type: GlobalActionTypes.SET_ERROR, payload: { error } });
    }
    return [];
  }

  const getSubCats = useCallback(async (categoryId: string | null) => {
    try {
      let parentHeader = "";
      const subCats: ICategoryRow[] = [];
      allCategoryRows.forEach((cat, id) => {  // globalState.cats is Map<string, ICat>
        if (id === categoryId) {
          parentHeader = ""; //cat.header!;
        }
        else if (cat.parentId === categoryId) {
          subCats.push(cat);
        }
      })
      return { subCats, parentHeader };
    }
    catch (error: any) {
      console.log(error)
      dispatch({ type: GlobalActionTypes.SET_ERROR, payload: { error } });
      return { subCats: [], parentHeader: 'Kiks subCats' }
    }
  }, [allCategoryRows]);

  const getCat = useCallback(async (id: string): Promise<ICategoryRow | undefined> => {
    try {
      const cat: ICategoryRow | undefined = allCategoryRows.get(id);  // globalState.cats is Map<string, ICat>
      return cat;
    }
    catch (error: any) {
      console.log(error)
      dispatch({ type: GlobalActionTypes.SET_ERROR, payload: { error } });
    }
    return undefined;
  }, [allCategoryRows]);


  const health = () => {
    const url = `api/health`;
    // axios
    //   .post(url)
    //   .then(({ status }) => {
    //     if (status === 200) {
    //       console.log('health successfull:', status)
    //     }
    //     else {
    //       console.log('Status is not 200', status)
    //     }
    //   })
    //   .catch((err: any | Error) => {
    //     console.log(err);
    //   });
  };

  const setNodesReloaded = () => {
    if (!globalState.nodesReLoaded) {
      dispatch({ type: GlobalActionTypes.SET_NODES_RELOADED })
    }
  }

  const getAnswer = async (answerKey: IAnswerKey): Promise<any> => {
    return new Promise(async (resolve) => {
      try {
        const { topId, id } = answerKey;
        //const url = `${process.env.REACT_APP_API_URL}/Answer/${parentId}/${id}`;
        //console.log(`FETCHING --->>> ${url}`)
        //dispatch({ type: GlobalActionTypes.SET_LOADING, payload: {} })
        console.time()
        /*
        axios
          .get(url, {
            withCredentials: false,
            headers: {
              'Content-Type': 'application/json',
              'Access-Control-Allow-Origin': "*"
            }
          })
          .then(({ data: answerDto }) => {
            const categories: IGroup[] = [];
            console.timeEnd();
            const answer: IAnswer = new Answer(answerDto, parentId).answer;
            answer.groupTitle = 'nadji me';
            resolve(answer);
          })
          .catch((error) => {
            console.log('FETCHING --->>>', error);
          });
        */
        const url = `${protectedResources.KnowledgeAPI.endpointAnswer}/${topId}/${id}`;
        await Execute("GET", url).then((answerDto: IAnswerDto) => {
          console.timeEnd();
          console.log({ response: answerDto });
          const answer: IAnswer = new Answer(answerDto).answer;
          resolve(answer);
        });


      }
      catch (error: any) {
        console.log(error);
        dispatch({ type: GlobalActionTypes.SET_ERROR, payload: error });
      }
    });
  }

  const globalGetGroupRow = useCallback(async (id: string): Promise<IGroupRow | undefined> => {
    try {
      const { allGroupRows: groupRows } = globalState;
      const groupRow: IGroupRow | undefined = groupRows.get(id);  // globalState.cats is Map<string, ICat>
      return groupRow!;
    }
    catch (error: any) {
      console.log(error)
      dispatch({ type: GlobalActionTypes.SET_ERROR, payload: { error } });
    }
    return undefined;
  }, [globalState.allGroupRows]);


  const getGroupRowsByKind = async (kind: number): Promise<IGroupRow[]> => {
    try {
      const { allGroupRows: shortGroups } = globalState;
      const groups: IGroupRow[] = [];
      shortGroups.forEach((c, id) => {
        if (c.kind === kind) {
          const { topId: topId, id, header, title, level } = c;
          const groupRow: IGroupRow = {
            topId,
            id,
            header,
            title,
            //link,
            parentId: "",
            titlesUpTheTree: "",
            //variations: [],
            hasSubGroups: false,
            level,
            kind,
            isExpanded: false,
            link: null,
            groupRows: [],
            variations: [],
            numOfAnswers: 0,
            answerRows: []
          }
          groups.push(groupRow);
        }
      })
      return groups;
    }
    catch (error: any) {
      console.log(error)
      dispatch({ type: GlobalActionTypes.SET_ERROR, payload: { error } });
    }
    return [];
  }

  const addHistory = useCallback(
    async (history: IHistory) => {
      //const { topId, id, variations, title, kind, modified } = history;
      //dispatch({ type: ActionTypes.SET_CATEGORY_LOADING, payload: { id, loading: false } });
      try {
        const historyDto = new HistoryDto(history).historyDto;
        console.log("historyDto", { historyDto })
        const url = `${protectedResources.KnowledgeAPI.endpointHistory}`;
        console.time()
        await Execute("POST", url, historyDto)
          .then(async (questionDtoEx: IQuestionDtoEx) => {
            const { questionDto, msg } = questionDtoEx;
            console.timeEnd();
            if (questionDto) {
              //const history = new History(historyDto).history;
              console.log('History successfully created', { questionDto })
              // dispatch({ type: ActionTypes.SET_ADDED_CATEGORY, payload: { category: { ...category, questions: [] } } });
              // dispatch({ type: ActionTypes.CLOSE_CATEGORY_FORM })
              //await loadCats(); // reload
            }
          });
      }
      catch (error: any) {
        console.log(error)
        //dispatch({ type: ActionTypes.SET_ERROR, payload: { error: new Error('Server Error') } });
      }
    }, []);

  const getAnswersRated = async (questionKey: IQuestionKey): Promise<any> => {
    const mapAnswerRating = new Map<string, IAssignedAnswer>();
    // try {
    //   console.log("getAnswersRated", { questionKey })
    //   const url = `${protectedResources.KnowledgeAPI.endpointHistory}/${questionKey.topId}/${questionKey.id}`;
    //   console.time()
    //   const answerRatedListEx: IAnswerRatedListEx = { answerRatedList: null, msg: "" }
    //   await Execute("GET", url)
    //     .then(async (answerRatedDtoListEx: IAnswerRatedDtoListEx) => {
    //       console.timeEnd();
    //       const { answerRatedDtoList, msg } = answerRatedDtoListEx;
    //       if (answerRatedDtoList) {
    //         answerRatedDtoList.forEach(answerRatedDto => {
    //           const answerRated = new AnswerRated(answerRatedDto).answerRated;
    //           const { answerKey, numOfFixed, numOfNotFixed, numOfNotClicked } = answerRated;
    //           const answerId = answerKey.id;
    //           /*
    //           if (!mapAnswerRating.has(answerId)) {
    //             mapAnswerRating.set(answerId, { fixed: fixed === true ? 1 : 0, notFixed: fixed === false ? 1 : 0, Undefined: fixed === undefined ? 1 : 0 });
    //           }
    //           else {
    //             const answerRating = mapAnswerRating.get(answerId);
    //             switch (fixed) {
    //               case true:
    //                 answerRating!.fixed++;
    //                 break;
    //               case false:
    //                 answerRating!.notFixed++;
    //                 break;
    //               case undefined:
    //                 answerRating!.Undefined++;
    //                 break;
    //               default:
    //                 alert('unk rate')
    //                 break;
    //             }
    //             mapAnswerRating.set(answerId, answerRating!);
    //           }
    //           const arr: IAnswerRated[] = [];
    //           mapAnswerRating.forEach((value, key) => {
    //             arr.push({ answerId: key, ...value })
    //           })
    //           answerRatings.answerRatedList = arr.sort(compareFn);
    //             */
    //         })
    //       }
    //       else {
    //         answerRatedListEx.msg = msg;
    //       }
    //     });
    //   return answerRatedListEx;
    // }
    // catch (error: any) {
    //   console.log(error);
    //   const answerRatedListEx: IAnswerRatedListEx = {
    //     answerRatedList: null, msg: "Server problemos"
    //   }
    //   return answerRatedListEx;
    // }
  }


  const addHistoryFilter = useCallback(async (historyFilterDto: IHistoryFilterDto) => {
    //const { topId, id, variations, title, kind, modified } = history;
    //dispatch({ type: ActionTypes.SET_CATEGORY_LOADING, payload: { id, loading: false } });
    try {
      //const historyDto = new HistoryDto(historyFilterDto).historyDto;
      //console.log("historyDto", { historyDto })
      const url = `${protectedResources.KnowledgeAPI.endpointHistoryFilter}`;
      console.time()
      await Execute("POST", url, historyFilterDto)
        .then(async (questionDtoEx: IQuestionDtoEx) => {
          const { questionDto, msg } = questionDtoEx;
          console.timeEnd();
          if (questionDto) {
            //const history = new History(historyDto).history;
            console.log('History Filter successfully created', { questionDto });
            // dispatch({ type: ActionTypes.SET_ADDED_CATEGORY, payload: { category: { ...category, questions: [] } } });
            // dispatch({ type: ActionTypes.CLOSE_CATEGORY_FORM })
            //await loadCats(); // reload
          }
        });
    }
    catch (error: any) {
      console.log(error)
      //dispatch({ type: ActionTypes.SET_ERROR, payload: { error: new Error('Server Error') } });
    }
  }, []);

  const setLastRouteVisited = useCallback((lastRouteVisited: string): void => {
    dispatch({ type: GlobalActionTypes.SET_LAST_ROUTE_VISITED, payload: { lastRouteVisited } });
  }, []);

  useEffect(() => {
    (async () => {
      await OpenDB();
    })()
  }, [OpenDB])

  return (
    <GlobalContext.Provider value={{
      globalState, OpenDB, setLastRouteVisited,
      getUser, health,
      loadAndCacheAllCategoryRows, getCat, getSubCats, getCatsByKind,
      searchQuestions, getQuestion,
      loadAndCacheAllGroupRows, globalGetGroupRow, getGroupRows, getGroupRowsByKind, searchAnswers, getAnswer,
      setNodesReloaded,
      addHistory, getAnswersRated, addHistoryFilter
    }}>
      <GlobalDispatchContext.Provider value={dispatch}>
        {children}
      </GlobalDispatchContext.Provider>
    </GlobalContext.Provider>
  );
}

export function useGlobalContext() {
  return useContext(GlobalContext);
}

export const useGlobalDispatch = () => {
  return useContext(GlobalDispatchContext)
}

export const useGlobalState = () => {
  const { globalState } = useGlobalContext()
  return globalState;
}
