import { useGlobalState, useGlobalContext } from 'global/GlobalProvider'
import React, { createContext, useContext, useReducer, useCallback, Dispatch, useEffect } from 'react';

import {
  ActionTypes, ICategory, IQuestion, ICategoriesContext,
  ICategoryDtoEx, ICategoryKey, CategoryKey, Category, CategoryDto,
  IQuestionDtoEx, IQuestionEx, IQuestionKey, IQuestionRow,
  Question,
  QuestionDto,
  QuestionRowDto,
  ICategoryRow,
  ICategoryRowDtoEx,
  CategoryRow,
  ICategoryRowDto,
  ILoadCategoryQuestions,
  QuestionKey,
  FormMode,
  CategoryRowDto,
  IExpandInfo,
  IKeyExpanded,
  IAssignedAnswerKey,
  QuestionKeyDto,
  ICategoriesState,
  ILocStorage,
  IQuestionDto
} from 'categories/types';

import { CategoryReducer, initialQuestion, initialCategory } from 'categories/CategoryReducer';
import { IAssignedAnswer, AssignedAnswerDto } from 'categories/types';
import { Dto2WhoWhen } from 'global/types';

const CategoriesContext = createContext<ICategoriesContext>({} as any);
const CategoryDispatchContext = createContext<Dispatch<any>>(() => null);

type IProps = {
  children: React.ReactNode
}

export const initialState: ICategoriesState = {
  formMode: FormMode.None,

  allCategoryRows: new Map<string, ICategoryRow>(),
  allCategoryRowsLoaded: undefined,

  topRows: [],
  topRowsLoading: false,
  topRowsLoaded: false,

  nodeOpening: false,
  nodeOpened: false,

  keyExpanded: null,

  categoryId_questionId_done: undefined,

  activeCategory: null,
  activeQuestion: null,
  selectedQuestionId: null,

  loadingCategories: false,
  loadingQuestions: false,
  loadingCategory: false, categoryLoaded: false,
  loadingQuestion: false, questionLoaded: false,

  rowExpanding: false,
  rowExpanded: false
}

export const CategoryProvider: React.FC<IProps> = ({ children }) => {

  const { getCat } = useGlobalContext()
  const globalState = useGlobalState();
  const { KnowledgeAPI, isAuthenticated, workspace, authUser, canEdit } = globalState;
  const { nickName } = authUser;

  const [state, dispatch] = useReducer(CategoryReducer, initialState);

  const { formMode, activeCategory, activeQuestion, keyExpanded, topRows, allCategoryRows, allCategoryRowsLoaded } = state;

  console.log('----->>> ----->>> ----->>> CategoryProvider')

  useEffect(() => {

    let keyExpanded: IKeyExpanded = workspace === 'SLINDZA'
      ? { topId: "QUESTIONS", categoryId: "QUESTIONS", questionId: "qqqqqq111" }
      : { topId: "MTS", categoryId: "REMOTECTRLS", questionId: "qqqqqq111" }

    if ('localStorage' in window) {
      let s = localStorage.getItem('CATEGORIES_STATE');
      console.log('CATEGORIES_STATE loaded before signIn', s)
      if (s !== null) {
        const locStorage: ILocStorage = JSON.parse(s);
        if (locStorage.keyExpanded !== null)
          keyExpanded = locStorage.keyExpanded!;
      }
    }
    dispatch({ type: ActionTypes.SET_FROM_LOCAL_STORAGE, payload: { keyExpanded } });
  }, [workspace]);

  //const _question: IQuestion | null = null;

  /*
  class QQuestion {
    // constructor(dto: IQuestionDto) { //, parentId: string) {
    //   // TODO possible to call base class construtor
    //   // this.question = { ...initialQuestion }
    // }
    static getQuestion(dto: IQuestionDto) {
      //this.question = { ...initialQuestion }
      QQuestion.question = new Question(dto).question
      
      this.question.topId = dto.TopId//'aha // TODO will be set later
      this.question.parentId = dto.ParentId ?? ''
      this.question.id = dto.Id
      this.question.title = dto.Title
      this.question.categoryTitle = dto.CategoryTitle
      this.question.assignedAnswers = []
      this.question.numOfAssignedAnswers = dto.NumOfAssignedAnswers ?? 0
      this.question.relatedFilters = []
      this.question.numOfRelatedFilters = dto.NumOfRelatedFilters ?? 0
      this.question.source = dto.Source ?? 0
      this.question.status = dto.Status ?? 0
      this.question.included = dto.Included !== undefined
      this.question.created = new Dto2WhoWhen(dto.Created!).whoWhen
      this.question.modified = dto.Modified
        ? new Dto2WhoWhen(dto.Modified).whoWhen
        : undefined
        
      return QQuestion.question
    }
    static question: IQuestion
  }
  */

  const Execute = useCallback(
    async (
      method: string,
      endpoint: string,
      data: Object | null = null,
      whichRowId: string | undefined = undefined
    ): Promise<any> => {
      const accessToken = localStorage.getItem("accessToken");
      if (accessToken) {
        try {
          console.log("------Execute endpoint:", endpoint)
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
    }, []);


  // ---------------------------
  // load all categoryRows
  // ---------------------------
  const loadAllCategoryRows = useCallback(async (): Promise<any> => {
    return new Promise(async (resolve) => {
      try {
        console.time();
        const url = `${KnowledgeAPI.endpointCategoryRow}/${workspace}`;
        await Execute("GET", url, null)
          .then((catRowDtos: ICategoryRowDto[]) => {   //  | Response
            const allCategoryRows = new Map<string, ICategoryRow>();
            console.timeEnd();
            catRowDtos.forEach((rowDto: ICategoryRowDto) => allCategoryRows.set(rowDto.Id, new CategoryRow(rowDto).categoryRow));
            allCategoryRows.forEach(cat => {
              let { id, parentId } = cat; // , title, variations, hasSubCategories, level, kind
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
            dispatch({ type: ActionTypes.SET_ALL_CATEGORY_ROWS, payload: { allCategoryRows } });
            resolve(true)
          });
      }
      catch (error: any) {
        console.log(error)
        dispatch({ type: ActionTypes.SET_ERROR, payload: { error } });
      }
      resolve(true);
    });
  }, [Execute, KnowledgeAPI.endpointCategoryRow, workspace]);


  useEffect(() => {
    if (allCategoryRowsLoaded === undefined) /// isAuthenticated && 
      loadAllCategoryRows();
  }, [allCategoryRowsLoaded, loadAllCategoryRows]);


  const loadTopRows = useCallback(async () => {
    return new Promise(async (resolve) => {
      //const { keyExpanded } = state;
      try {
        dispatch({ type: ActionTypes.SET_TOP_ROWS_LOADING, payload: {} });
        const url = `${KnowledgeAPI.endpointCategoryRow}/${workspace}/null/topRows/all`;
        console.log('CategoryProvider loadTopRows url:', url)
        console.log('1111111111111111111111111111111111111111111111')
        console.time();
        await Execute("GET", url)
          .then((dtos: ICategoryRowDto[]) => {
            console.timeEnd();
            console.log('222222222222222222222222222222222222222222222')
            const topRows = dtos!.map((dto: ICategoryRowDto) => {
              dto.IsExpanded = keyExpanded
                ? dto.Id === keyExpanded.categoryId
                : false;
              //dto.TopId = dto.QuestionId;
              return new CategoryRow(dto).categoryRow;
            })
            dispatch({ type: ActionTypes.SET_TOP_ROWS, payload: { topRows } });
            resolve(true);
          });
      }
      catch (error: any) {
        console.log(error)
        dispatch({ type: ActionTypes.SET_ERROR, payload: { error } });
      }
    })
  }, [Execute, KnowledgeAPI.endpointCategoryRow, keyExpanded, workspace]); // state, 


  // get category With subcategoryRows and questionRows
  const getCategory = useCallback(
    async (categoryKey: ICategoryKey, includeQuestionId: string | null): Promise<any> => {
      const { topId, id } = categoryKey;
      console.log({ categoryKey, includeQuestionId })
      return new Promise(async (resolve) => {
        try {
          const url = `${KnowledgeAPI.endpointCategory}/${workspace}/${topId}/${id}/${PAGE_SIZE}/${includeQuestionId}`;
          console.time()
          console.log('================ getCategory =======================')
          await Execute("GET", url)
            .then((categoryDtoEx: ICategoryDtoEx) => {
              console.timeEnd();
              const { categoryDto, msg } = categoryDtoEx;
              if (categoryDto) {
                resolve(new Category(categoryDto).category);
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
    }, [Execute, KnowledgeAPI.endpointCategory, workspace]);


  const findCategoryRow = useCallback(
    (categoryRow: ICategoryRow, id: string): ICategoryRow | undefined => {
      if (categoryRow.parentId === null)
        return categoryRow;
      const { categoryRows } = categoryRow;
      let cat: ICategoryRow | undefined = categoryRows.find(c => c.id === (id ?? 'null'));
      if (!cat) {
        try {
          categoryRows.forEach(c => {
            console.log(id, c.id)
            cat = findCategoryRow(c, id);
            if (cat) {
              throw new Error("Stop the loop");
            }
          })
        }
        catch (e) {
          // console.log("Loop stopped");
        }
      }
      return cat;
    }, []);


  const openNode = useCallback(
    async (catKey: ICategoryKey, questionId: string | null, fromChatBotDlg: string = 'false'): Promise<any> => {
      return new Promise(async (resolve) => {
        try {
          let { topId, id } = catKey;
          console.assert(id);
          if (id) {
            const categoryRow: ICategoryRow | undefined = allCategoryRows.get(id);
            if (categoryRow) {
              catKey.topId = categoryRow.topId;
            }
            else {
              alert('reload all categoryRow:' + id)
              //return
            }
          }
          dispatch({ type: ActionTypes.NODE_OPENING, payload: { fromChatBotDlg: fromChatBotDlg === 'true' } })
          // ---------------------------------------------------------------------------
          console.time();
          const categoryKey: ICategoryKey = { topId, id, parentId: null }; // proveri ROOT
          /*
          const category: ICategory = await getCategory(catKey, questionId);
          //const { hasSubCategories, numOfQuestions } = category;
          dispatch({
            type: ActionTypes.SET_NODE_OPENED, payload: {
              catKey,
              //categoryRow,
              canEdit,
              category,
              questionId: questionId ?? null,
              fromChatBotDlg: fromChatBotDlg === 'true'
            }
          })
            */
          const query = new CategoryKey(categoryKey).toQuery(workspace);
          const url = `${KnowledgeAPI.endpointCategoryRow}?${query}`;
          await Execute("GET", url)
            .then(async (categoryRowDtoEx: ICategoryRowDtoEx) => {
              //dispatch({ type: ActionTypes.CLEAN_SUB_TREE, payload: { categoryKey: categoryKey! } });
              const { categoryRowDto } = categoryRowDtoEx;
              console.timeEnd();
              if (categoryRowDto) {
                let categoryRow: ICategoryRow | null = new CategoryRow(categoryRowDto).categoryRow;
                if (categoryRow.parentId !== null) {
                  categoryRow = findCategoryRow(categoryRow, id!)!;
                }
                console.log('>>> openNode categoryRow', { categoryRow })
                dispatch({
                  type: ActionTypes.SET_NODE_OPENED, payload: {
                    catKey,
                    canEdit,
                    categoryRow,
                    questionId: questionId ?? null,
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
    }, [workspace, KnowledgeAPI.endpointCategoryRow, Execute, allCategoryRows, findCategoryRow, canEdit]);



  const getCategoryRow = useCallback(
    async (categoryKey: ICategoryKey, hidrate: boolean = false, includeQuestionId: string | null = null): Promise<any> => {
      const query = new CategoryKey(categoryKey).toQuery(workspace);
      return new Promise(async (resolve) => {
        try {
          const url = `${KnowledgeAPI.endpointCategoryRow}/${hidrate}/${PAGE_SIZE}/${includeQuestionId}?${query}`;
          console.time()
          await Execute("GET", url)
            .then((categoryRowDtoEx: ICategoryRowDtoEx) => {
              console.timeEnd();
              const { categoryRowDto, msg } = categoryRowDtoEx;
              if (categoryRowDto) {
                //categoryRowDto.TopId = topId;
                resolve(new CategoryRow(categoryRowDto).categoryRow);
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
    }, [Execute, KnowledgeAPI.endpointCategoryRow, workspace]);


  const expandCategory = useCallback(
    async ({ categoryKey, includeQuestionId, newCategoryRow, newQuestionRow, formMode, byClick = false }: IExpandInfo): Promise<any> => {
      try {
        //const { keyExpanded } = state;
        dispatch({ type: ActionTypes.SET_ROW_EXPANDING, payload: {} });
        const categoryRow: ICategoryRow = await getCategoryRow(categoryKey, true, includeQuestionId); // to reload Category
        if (categoryRow instanceof Error) {
          dispatch({ type: ActionTypes.SET_ERROR, payload: { error: categoryRow } });
          console.error({ cat: categoryRow })
        }
        else {
          let selectedQuestionId: string | undefined = undefined;
          if (includeQuestionId && categoryRow.questionRows.filter((row: IQuestionRow) => row.included).length > 0) {
            selectedQuestionId = includeQuestionId;
          }
          if (newCategoryRow) {
            categoryRow.categoryRows = [newCategoryRow, ...categoryRow.categoryRows];
          }
          if (newQuestionRow) {
            categoryRow.questionRows = [newQuestionRow, ...categoryRow.questionRows];
          }
          categoryRow.isExpanded = true;
          if (formMode === FormMode.None && includeQuestionId) {
            formMode = canEdit ? FormMode.EditingQuestion : FormMode.ViewingQuestion
          }
          dispatch({ type: ActionTypes.SET_ROW_EXPANDED, payload: { categoryRow, formMode: formMode!, selectedQuestionId } });
          return categoryRow;
        }
      }
      catch (error: any) {
        console.log('error', error);
        dispatch({ type: ActionTypes.SET_ERROR, payload: { error } });
        return null;
      }
    }, [canEdit, getCategoryRow]);


  const collapseCategory = useCallback(
    async (categoryRow: ICategoryRow) => {
      const { topId, id } = categoryRow;
      //const { topRows } = state;
      const topRow: ICategoryRow = topRows.find(c => c.id === topId)!;
      //const categoryRow: ICategoryRow = findCategoryRow(topRow.categoryRows, id)!;
      const catRow: ICategoryRow = (topRow.id === id)
        ? topRow
        : findCategoryRow(topRow, id)!;
      categoryRow = { ...catRow, isExpanded: false, categoryRows: [], questionRows: [] }
      // rerender
      dispatch({ type: ActionTypes.SET_ROW_COLLAPSED, payload: { categoryRow } })
    }, [findCategoryRow, topRows]);


  const addSubCategory = useCallback(
    async (categoryRow: ICategoryRow | null) => {
      try {
        if (formMode !== FormMode.None) {
          dispatch({ type: ActionTypes.CLOSE_CATEGORY_FORM, payload: {} })
        }
        const newCategoryRow: ICategoryRow = {
          ...initialCategory,
          topId: 'generateId',
          parentId: null,
          id: 'generateId',
          level: 1,
          title: ''
        }
        if (categoryRow === null) { // add topRow
          dispatch({
            type: ActionTypes.SET_CATEGORY_TO_ADD_TOP, payload: {
              //categoryRow: { categoryRow, categoryRows: [newCategoryRow, ...categoryRow.categoryRows]
              newCategoryRow
            }
          });
        }
        else {
          const { topId, parentId, level } = categoryRow;
          if (parentId !== null) {
            const topRow: ICategoryRow = state.topRows.find(c => c.id === topId)!;
            categoryRow = findCategoryRow(topRow, parentId!)!;
          }
          dispatch({
            type: ActionTypes.SET_CATEGORY_TO_ADD, payload: {
              categoryRow: { 
                ...categoryRow, 
                level: level + 1,
                categoryRows: [newCategoryRow, ...categoryRow.categoryRows]
              },
              newCategoryRow: {...newCategoryRow, level: level + 1}
            }
          })
          // dispatch({
          //   type: ActionTypes.SET_CATEGORY, payload: {
          //     categoryRow: { ...newCategoryRow, doc1: ''}
          //   }
          // })
          //const categoryKey: ICategoryKey = { topId, parentId, id };
          // const newCategoryRow: ICategoryRow = {
          //   ...initialCategory,
          //   topId,
          //   parentId,
          //   id: 'generateId',
          //   level,
          //   title: '' // new Category
          // }
          /*
          if (isExpanded) {
            categoryRows.map(g => g.isExpanded = false);
            const categoryRow2: ICategoryRow = {
              ...categoryRow,
              categoryRows: [newCategoryRow, ...categoryRows],
            }
            dispatch({ type: ActionTypes.SET_ROW_EXPANDED, payload: { categoryRow: categoryRow2, formMode: FormMode.AddingCategory } });
            dispatch({ type: ActionTypes.SET_CATEGORY, payload: { categoryRow: { ...newCategoryRow, doc1: '' } } });
          }
          else {
            const expandInfo: IExpandInfo = {
              categoryKey,
              formMode: FormMode.AddingCategory,
              newCategoryRow
            }
            const row: ICategoryRow | null = await expandCategory(expandInfo);
            if (row) {
              const category: ICategory = {
                ...newCategoryRow,
                doc1: ''
              }
              dispatch({ type: ActionTypes.SET_CATEGORY, payload: { categoryRow: category } });
            }
          }
            */
        }
      }
      catch (error: any) {
        console.log('error', error);
        dispatch({ type: ActionTypes.SET_ERROR, payload: { error } });
      }
    }, [findCategoryRow, formMode, state.topRows]);


  const cancelAddCategory = useCallback(
    async () => {
      try {
        const { topId, id, parentId } = activeCategory!;
        const categoryKey: ICategoryKey = { topId, parentId, id }; // TODO proveri

        const expandInfo: IExpandInfo = {
          categoryKey,
          formMode: FormMode.None
        }
        const categoryRow: ICategoryRow | null = await expandCategory(expandInfo);
        if (categoryRow) {
          dispatch({ type: ActionTypes.CANCEL_ADD_SUB_CATEGORY, payload: { categoryRow } });
        }
      }
      catch (error: any) {
        console.log('error', error);
        dispatch({ type: ActionTypes.SET_ERROR, payload: { error } });
      }
    }, [activeCategory, expandCategory]);


  const createCategory = useCallback(
    async (category: ICategory) => {
      const { id } = category;
      dispatch({ type: ActionTypes.SET_LOADING_CATEGORY, payload: {} });
      try {
        const categoryDto = new CategoryDto(category, workspace).categoryDto;
        console.log("categoryDto", { categoryDto })
        const url = `${KnowledgeAPI.endpointCategory}`; //
        console.time()
        await Execute("POST", url, categoryDto, id)
          .then(async (categoryDtoEx: ICategoryDtoEx) => {   //  | null
            console.timeEnd();
            const { categoryDto } = categoryDtoEx;
            if (categoryDto) {
              //categoryDto.TopId = topId!;
              const category = new Category(categoryDto).category;
              console.log('Category successfully created', { category })

              await loadAllCategoryRows()
                .then(async (done: boolean) => {
                  await loadTopRows();
                  if (category.parentId === null) {
                    dispatch({ type: ActionTypes.SET_CATEGORY_ADDED, payload: { categoryRow: category } }); // ICategory extends ICategory Row
                  }
                  else {
                    const parentCategoryKey: ICategoryKey = {
                      topId: category.topId,
                      parentId: "doesn't matter",
                      id: category.parentId!
                    };
                    const expandInfo: IExpandInfo = {
                      categoryKey: parentCategoryKey,
                      formMode: FormMode.AddingCategory
                    }
                    alert('zovem expa')
                    await expandCategory(expandInfo).then(() => {
                      dispatch({ type: ActionTypes.SET_CATEGORY_ADDED, payload: { categoryRow: category } }); // ICategory extends ICategory Row
                    });
                  }
                })
            }
          });
      }
      catch (error: any) {
        console.log(error)
        dispatch({ type: ActionTypes.SET_ERROR, payload: { error: new Error('Server Error'), whichRowId: id } });
      }
    }, [Execute, KnowledgeAPI.endpointCategory, expandCategory, loadAllCategoryRows, workspace]);


  const cancelAddQuestion = useCallback(
    async () => {
      try {
        const { topId, parentId } = activeQuestion!;
        const categoryKey: ICategoryKey = { topId, parentId, id: parentId! };
        const expandInfo: IExpandInfo = {
          categoryKey,
          formMode: FormMode.None
        }
        const categoryRow: ICategoryRow | null = await expandCategory(expandInfo);
        if (categoryRow) {
          dispatch({ type: ActionTypes.CANCEL_ADD_QUESTION, payload: { categoryRow } });
        }
      }
      catch (error: any) {
        console.log('error', error);
        dispatch({ type: ActionTypes.SET_ERROR, payload: { error } });
      }
    }, [activeQuestion, expandCategory]);

  const viewCategory = useCallback(async (categoryRow: ICategoryRow, includeQuestionId: string | null) => {
    if (formMode === FormMode.AddingQuestion) {
      await cancelAddQuestion();
    }
    else if (formMode === FormMode.AddingCategory) {
      await cancelAddCategory();
    }

    dispatch({ type: ActionTypes.SET_LOADING_CATEGORY, payload: { categoryRow } });
    const categoryKey = new CategoryKey(categoryRow).categoryKey!;
    const category: ICategory = await getCategory(categoryKey, includeQuestionId);
    if (category instanceof Error)
      dispatch({ type: ActionTypes.SET_ERROR, payload: { error: category } });
    else {
      category.topId = categoryRow.topId;
      dispatch({ type: ActionTypes.SET_CATEGORY_TO_VIEW, payload: { categoryRow: category } });
    }
  }, [cancelAddCategory, cancelAddQuestion, formMode, getCategory]);


  const editCategory = useCallback(async (categoryRow: ICategoryRow, includeQuestionId: string | null) => {
    includeQuestionId = null;
    const { topId, parentId } = categoryRow;
    if (formMode === FormMode.AddingQuestion) {
      await cancelAddQuestion();
    }
    else if (formMode === FormMode.AddingCategory) {
      await cancelAddCategory();
    }
    dispatch({ type: ActionTypes.SET_LOADING_CATEGORY, payload: {} });
    const categoryKey = new CategoryKey(categoryRow).categoryKey!;
    const category: ICategory = await getCategory(categoryKey, includeQuestionId);
    if (category instanceof Error)
      dispatch({ type: ActionTypes.SET_ERROR, payload: { error: category } });
    else {
      const catRow: ICategoryRow = { ...category, isExpanded: false, categoryRows: [], questionRows: [] }
      dispatch({ type: ActionTypes.SET_CATEGORY_TO_EDIT, payload: { categoryRow: catRow, category } });
      /*
      if (parentId === null) { // topRow
        category.topId = categoryRow.topId;
        dispatch({ type: ActionTypes.SET_CATEGORY_TO_EDIT, payload: { categoryRow: category } });
      }
      else {
        const parentKey: ICategoryKey = { topId, parentId, id: parentId }
        // get acurate info from server (children will be collapsed)
        const expandInfo: IExpandInfo = {
          categoryKey: parentKey,
          formMode: FormMode.EditingCategory
        }
        await expandCategory(expandInfo).then(() => {
          category.topId = categoryRow.topId;
          dispatch({ type: ActionTypes.SET_CATEGORY_TO_EDIT, payload: { categoryRow: category } });
        })
      }
        */
    }
  }, [cancelAddCategory, cancelAddQuestion, formMode, getCategory]);


  const updateCategory = useCallback(
    async (category: ICategory, closeForm: boolean) => {
      //const { topId, id, variations, title, kind, modified } = category;
      dispatch({ type: ActionTypes.SET_LOADING_CATEGORY, payload: {} });
      try {
        const categoryDto = new CategoryDto(category, workspace).categoryDto;
        const url = `${KnowledgeAPI.endpointCategory}`;
        console.time()
        await Execute("PUT", url, categoryDto)
          .then((categoryDtoEx: ICategoryDtoEx) => {
            console.timeEnd();
            const { categoryDto, msg } = categoryDtoEx;
            if (categoryDto) {
              const category = new Category(categoryDto).category;
              const { topId } = category;
              category.isExpanded = false;
              category.topId = topId;
              dispatch({ type: ActionTypes.SET_CATEGORY_UPDATED, payload: { /*categoryRow: category, */category } });
              // if (closeForm) {
              //   dispatch({ type: ActionTypes.CLOSE_CATEGORY_FORM, payload: {} })
              // }
            }
            else {
              dispatch({ type: ActionTypes.SET_ERROR, payload: { error: new Error(`${msg}`) } });
            }
          });
      }
      catch (error: any) {
        console.log(error)
        dispatch({ type: ActionTypes.SET_ERROR, payload: { error: new Error("Karambol") } });
        return error;
      }
    }, [Execute, KnowledgeAPI.endpointCategory, workspace]);


  const deleteCategory = useCallback(async (categoryRow: ICategoryRow) => {
    //dispatch({ type: ActionTypes.SET_CATEGORY_LOADING, payload: { id, loading: false } });
    try {
      const { topId, parentId } = categoryRow;
      const categoryDto = new CategoryRowDto(categoryRow, workspace).categoryRowDto;
      const url = `${KnowledgeAPI.endpointCategory}`;
      console.time()
      await Execute("DELETE", url, categoryDto)    //Modified: {  Time: new Date(), NickName: globalState.authUser.nickName }
        .then(async (categoryDtoEx: ICategoryDtoEx) => {
          console.timeEnd();
          const { categoryDto, msg } = categoryDtoEx;
          if (msg === "OK") {
            // await loadAndCacheAllCategoryRows(); // reload
            console.log('Category successfully deleted', { categoryRow })
            await loadAllCategoryRows()
              .then(async (done: boolean) => {
                const expandInfo: IExpandInfo = {
                  categoryKey: { topId, parentId: '', id: parentId! },
                  formMode: FormMode.None
                }
                if (parentId) {
                  alert('argh')
                  await loadTopRows();
                }
                else {
                  await expandCategory(expandInfo).then(() => {
                    // dispatch({ type: ActionTypes.DELETE_CATEGORY, payload: { id: categoryDto!.Id } });
                    // dispatch({ type: ActionTypes.SET_CATEGORY, payload: { categoryRow: category } }); // ICategory extends ICategory Row
                  });
                }
              })
          }
          else if (msg === "HasSubCategories") {
            dispatch({ type: ActionTypes.SET_ERROR, payload: { error: new Error("First remove sub categories"), whichRowId: categoryDto!.Id } });
          }
          else if (msg === "HasQuestions") {
            dispatch({ type: ActionTypes.SET_ERROR, payload: { error: new Error("First remove category questions"), whichRowId: categoryDto!.Id } });
          }
          else {
            dispatch({ type: ActionTypes.SET_ERROR, payload: { error: new Error(msg), whichRowId: categoryDto!.Id } });
          }
        })
    }
    catch (error: any) {
      console.log(error)
      return error;
    }
  }, [Execute, KnowledgeAPI.endpointCategory, expandCategory, loadAllCategoryRows, loadTopRows, workspace]);


  const deleteCategoryVariation = async (categoryKey: ICategoryKey, variationName: string) => {
    try {
      // const category = await dbp!.get('Categories', id);
      // const obj: ICategory = {
      //   ...category,
      //   variations: category.variations.filter((variation: string) => variation !== variationName),
      //   modified: {
      //     Time: new Date(),
      //     by: {
      //       nickName: globalState.authUser.nickName
      //     }
      //   }
      // }
      // POPRAVI TODO
      //updateCategory(obj, false);
      console.log("Category Tag successfully deleted");
    }
    catch (error: any) {
      console.log('error', error);
      dispatch({ type: ActionTypes.SET_ERROR, payload: { error } });
    }
  };


  ////////////////////////////////////
  // Questions
  //

  const PAGE_SIZE = 12;
  const loadCategoryQuestions = useCallback(async ({ categoryKey, startCursor, includeQuestionId }: ILoadCategoryQuestions): Promise<any> => {
    try {
      const { topId, id } = categoryKey;
      dispatch({ type: ActionTypes.SET_CATEGORY_QUESTIONS_LOADING, payload: {} })
      try {
        const url = `${KnowledgeAPI.endpointQuestion}/${workspace}/${topId}/${id}/${startCursor}/${PAGE_SIZE}/${includeQuestionId}`;
        console.time()
        await Execute!("GET", url).then((categoryDtoEx: ICategoryDtoEx) => {
          console.timeEnd();
          const { categoryDto } = categoryDtoEx;
          if (categoryDto !== null) {
            const category = new Category(categoryDto).category;
            // const { Title, QuestionRowDtos, HasMoreQuestions } = categoryDto;
            // QuestionRowDtos!.forEach((questionRowDto: IQuestionRowDto) => {
            //   if (includeQuestionId && questionRowDto.Id === includeQuestionId) {
            //     questionRowDto.Included = true;
            //   }
            //   questionRowDto.CategoryTitle = Title; // TODO treba li
            //   questionRowDtos.push(questionRowDto);
            // })
            // const questionRows: IQuestionRow[] = questionRowDtos.map(dto => new QuestionRow(dto).questionRow);
            // dispatch({
            //   type: ActionTypes.CATEGORY_QUESTIONS_LOADED,
            //   payload: { id, questionRows, hasMoreQuestions: HasMoreQuestions! }
            // });
            dispatch({
              type: ActionTypes.CATEGORY_QUESTIONS_LOADED,
              payload: { categoryRow: category }
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
  }, [Execute, KnowledgeAPI.endpointQuestion, workspace]);

  const addQuestion = useCallback(
    async (categoryKey: ICategoryKey, isExpanded: boolean) => {
      try {
        const { topId, id } = categoryKey;
        let categoryRow = await getCat(id!);
        if (!categoryRow) {
          alert(`Not found ${id}. Reload all Categories`)
          return;
        }
        const newQuestionRow: IQuestionRow = {
          topId,
          parentId: categoryKey.id,
          id: 'generateId', // do not change
          title: 'question text',
          categoryTitle: categoryRow.title,
          numOfAssignedAnswers: 0,
          included: true
        }
        const question: IQuestion = {
          ...initialQuestion,
          ...newQuestionRow,
          title: ''
        }
        if (isExpanded) {
          const topRow: ICategoryRow = state.topRows.find(c => c.id === topId)!;
          const catRow: ICategoryRow = (topRow.id === topRow.topId)
            ? topRow
            : findCategoryRow(topRow, id)!;
          catRow.questionRows = [newQuestionRow, ...catRow.questionRows];
          dispatch({ type: ActionTypes.ADD_NEW_QUESTION_TO_ROW, payload: { categoryRow: catRow, newQuestionRow } });
          dispatch({ type: ActionTypes.SET_QUESTION, payload: { question, formMode: FormMode.AddingQuestion } });
        }
        else {
          const expandInfo: IExpandInfo = {
            categoryKey,
            formMode: FormMode.AddingQuestion,
            newQuestionRow
          }
          await expandCategory(expandInfo);
          dispatch({ type: ActionTypes.SET_QUESTION, payload: { question, formMode: FormMode.AddingQuestion } });
        }

      }
      catch (error: any) {
        console.log('error', error);
        dispatch({ type: ActionTypes.SET_ERROR, payload: { error } });
      }
    }, [expandCategory, findCategoryRow, getCat, state.topRows]);


  const createQuestion = useCallback(
    async (question: IQuestion) => {
      const { topId, id, parentId } = question; // title, modified, 
      // TODO
      dispatch({ type: ActionTypes.SET_LOADING_CATEGORY, payload: {} });
      try {
        question.created!.nickName = nickName;
        const questionDto = new QuestionDto(question, workspace).questionDto;
        const url = `${KnowledgeAPI.endpointQuestion}`;
        console.time()
        console.log('>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>> createQuestion', questionDto)
        await Execute("POST", url, questionDto)
          .then(async (questionDtoEx: IQuestionDtoEx | null) => {
            console.timeEnd();
            if (questionDtoEx) {
              console.log("::::::::::::::::::::", { questionDtoEx });
              const { questionDto } = questionDtoEx;
              if (questionDto) {
                const question = new Question(questionDto).question;
                question.topId = topId;
                console.log('Question successfully created')
                //dispatch({ type: ActionTypes.CLOSE_QUESTION_FORM })
                await loadAllCategoryRows() // numOfQuestions changed
                  .then(async (done: boolean) => {
                    const parentCategoryKey: ICategoryKey = { topId, parentId, id: parentId! };
                    const expandInfo: IExpandInfo = {
                      categoryKey: parentCategoryKey,
                      formMode: FormMode.EditingQuestion
                    }
                    await expandCategory(expandInfo).then(() => {
                      dispatch({ type: ActionTypes.SET_QUESTION, payload: { formMode: FormMode.EditingQuestion, question } });
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
    }, [Execute, KnowledgeAPI.endpointQuestion, expandCategory, loadAllCategoryRows, nickName, workspace]);


  const updateQuestion = useCallback(
    async (oldParentId: string, question: IQuestion, categoryChanged: boolean) => {
      const { id } = question; // , title, modified, parentId
      // dispatch({ type: ActionTypes.SET_CATEGORY_LOADING, payload: { id: parentId!, loading: false } });
      try {
        question.modified!.nickName = nickName;
        const questionDto = new QuestionDto(question, workspace).questionDto;
        const url = `${KnowledgeAPI.endpointQuestion}`;
        console.time()
        questionDto.oldParentId = oldParentId;
        console.log('>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>> updateQuestion', questionDto)
        let questionRet: IQuestion | null = null;
        await Execute("PUT", url, questionDto)
          .then(async (questionDtoEx: IQuestionDtoEx) => {
            console.timeEnd();
            const { questionDto, msg } = questionDtoEx;
            if (questionDto) {
              questionRet = new Question(questionDto).question!;
              console.log('Question successfully updated: ', questionRet)
              const { topId, parentId } = questionRet;
              if (categoryChanged) {
                // nema koristi
                // dispatch({ type: ActionTypes.SET_QUESTION, payload: { question: questionRet } })
                const { topId, parentId, id } = questionRet;
                const keyExpanded: IKeyExpanded = {
                  topId,
                  categoryId: parentId!,
                  questionId: id
                }
                dispatch({ type: ActionTypes.FORCE_OPEN_NODE, payload: { keyExpanded } })
              }
              else {
                const parentCategoryKey: ICategoryKey = { topId, parentId, id: parentId! }; // proveri
                const expandInfo: IExpandInfo = {
                  categoryKey: parentCategoryKey,
                  formMode: FormMode.EditingQuestion
                }
                await expandCategory(expandInfo).then(() => {
                  dispatch({ type: ActionTypes.SET_QUESTION, payload: { formMode: FormMode.EditingQuestion, question: questionRet! } });
                });
              }
            }
            else {
              dispatch({ type: ActionTypes.SET_ERROR, payload: { error: new Error(msg) } });
            }
          });
        return questionRet;
      }
      catch (error: any) {
        console.log(error)
        dispatch({ type: ActionTypes.SET_ERROR, payload: { error: new Error('Server Error'), whichRowId: id } });
      }
    }, [Execute, KnowledgeAPI.endpointQuestion, expandCategory, nickName, workspace]);


  const deleteQuestion = useCallback(
    async (questionRow: IQuestionRow, isActive: boolean) => {
      const { id, parentId, topId } = questionRow;
      dispatch({ type: ActionTypes.SET_LOADING_QUESTION, payload: {} });
      try {
        const questionDto = new QuestionRowDto(questionRow, workspace).questionRowDto;
        const url = `${KnowledgeAPI.endpointQuestion}`;
        console.time()
        await Execute("DELETE", url, questionDto)
          .then(async (questionDtoEx: IQuestionDtoEx) => {
            const { questionDto } = questionDtoEx;
            console.timeEnd();
            if (questionDto) {
              const question = new Question(questionDto).question;
              console.log('Question successfully deleted')
              if (isActive) {
                dispatch({ type: ActionTypes.QUESTION_DELETED, payload: { question } });
              }
              /*
              //dispatch({ type: ActionTypes.CLOSE_QUESTION_FORM })
              await loadAndCacheAllCategoryRows(); // reload
              */
              const parentCategoryKey: ICategoryKey = { topId, parentId, id: parentId! }; // proveri
              const expandInfo: IExpandInfo = {
                categoryKey: parentCategoryKey,
                formMode: FormMode.None
              }
              await expandCategory(expandInfo).then(() => {
                // dispatch({ type: ActionTypes.SET_CATEGORY, payload: { categoryRow: category } }); // ICategory extends ICategory Row
              })
            }
            else {
              console.error(questionDtoEx);
              dispatch({ type: ActionTypes.SET_ERROR, payload: { error: new Error('Server Error'), whichRowId: id } });
            }
          });
      }
      catch (error: any) {
        console.log(error)
        dispatch({ type: ActionTypes.SET_ERROR, payload: { error: new Error('Server Error'), whichRowId: id } });
      }
    }, [Execute, KnowledgeAPI.endpointQuestion, expandCategory, workspace]);


  const gggetQuestion = useCallback(
    async (questionKey: IQuestionKey): Promise<any> => {
      return new Promise(async (resolve) => {
        console.time()
        console.log('getQuestion', questionKey)

        const query = new QuestionKey(questionKey).toQuery(workspace);
        const url = `${KnowledgeAPI.endpointQuestion}?${query}`;
        console.time()
        console.log('getQuestion', questionKey)
        await Execute("GET", url)
          .then((questionDtoEx: IQuestionDtoEx) => {
            const { questionDto, msg } = questionDtoEx;
            if (questionDto) {
              //const question = new Question(questionDto).question;
              const question = new Question(questionDto).question;
              const questionEx: IQuestionEx = {
                question,
                msg
              }
              resolve(questionEx);
            }
          })
        console.timeEnd();
      })
    }, [Execute, KnowledgeAPI.endpointQuestion, workspace]); // Question, Otherwise 


  const getQuestion = useCallback(
    async (questionKey: IQuestionKey): Promise<any> => {
      return new Promise(async (resolve) => {
        try {
          const query = new QuestionKey(questionKey).toQuery(workspace);
          const url = `${KnowledgeAPI.endpointQuestion}?${query}`;
          console.time()
          console.log('getQuestion', questionKey)
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
    }, [Execute, KnowledgeAPI.endpointQuestion, workspace]);


  const viewQuestion = useCallback(async (questionRow: IQuestionRow) => {
    const questionKey = new QuestionKey(questionRow).questionKey;
    dispatch({ type: ActionTypes.SET_LOADING_QUESTION, payload: {} });
    const questionEx: IQuestionEx = await getQuestion(questionKey!);
    if (formMode === FormMode.AddingQuestion) {
      await cancelAddQuestion();
    }
    else if (formMode === FormMode.AddingCategory) {
      await cancelAddCategory();
    }
    const { question, msg } = questionEx;
    if (question) {
      question.topId = questionRow.topId;
      dispatch({ type: ActionTypes.SET_QUESTION_TO_VIEW, payload: { question } });
    }
    else
      dispatch({ type: ActionTypes.SET_ERROR, payload: { error: new Error(msg) } });
  }, [cancelAddCategory, cancelAddQuestion, formMode, getQuestion]);


  // const editQuestion = useCallback(async (questionRow: IQuestionRow) => {
  //   const questionKey: IQuestionKey = new QuestionKey(questionRow).questionKey!;
  //   if (formMode === FormMode.AddingQuestion) {
  //     await cancelAddQuestion();
  //   }
  //   else if (formMode === FormMode.AddingCategory) {
  //     await cancelAddCategory();
  //   }
  //   dispatch({ type: ActionTypes.SET_LOADING_QUESTION, payload: {} });
  //   console.log("editQuestion:", questionKey)
  //   const question = initialQuestion;
  //   if (question) {
  //     // we don't reload categoryRows, just use isSelected from activeQuestion
  //     question.topId = questionRow.topId;
  //     dispatch({ type: ActionTypes.SET_QUESTION_TO_EDIT, payload: { question } });
  //   }
  // }, [cancelAddCategory, cancelAddQuestion, formMode]);


  const editQuestion = useCallback(async (questionRow: IQuestionRow) => {
    const questionKey: IQuestionKey = new QuestionKey(questionRow).questionKey!;
    if (formMode === FormMode.AddingQuestion) {
      await cancelAddQuestion();
    }
    else if (formMode === FormMode.AddingCategory) {
      await cancelAddCategory();
    }
    dispatch({ type: ActionTypes.SET_LOADING_QUESTION, payload: {} });
    console.log("editQuestion:", questionKey)
    const questionEx: IQuestionEx = await getQuestion(questionKey!);
    const { question, msg } = questionEx;
    if (question) {
      // we don't reload categoryRows, just use isSelected from activeQuestion
      question.topId = questionRow.topId;
      dispatch({ type: ActionTypes.SET_QUESTION_TO_EDIT, payload: { question } });
    }
    else
      dispatch({ type: ActionTypes.SET_ERROR, payload: { error: new Error(msg) } });
  }, [cancelAddCategory, cancelAddQuestion, formMode, getQuestion]);


  // action: 'Assign' or 'UnAssign'
  const assignQuestionAnswer = useCallback(
    async (action: 'Assign' | 'UnAssign', questionKey: IQuestionKey, assignedAnswerKey: IAssignedAnswerKey): Promise<any> => {
      try {
        var { topId, id } = assignedAnswerKey;
        var assignedAnswer: IAssignedAnswer = {
          topId,
          id,
          created: {
            time: new Date(),
            nickName
          }
        }
        const dto = new AssignedAnswerDto(assignedAnswer).assignedAnswerDto;
        dto.QuestionKeyDto = new QuestionKeyDto(questionKey, workspace).dto;
        let question: IQuestion | null = null;
        const url = `${KnowledgeAPI.endpointQuestionAnswer}/${action}`;
        console.time()
        await Execute("POST", url, dto)
          .then(async (questionDtoEx: IQuestionDtoEx) => {
            console.timeEnd();
            const { questionDto } = questionDtoEx;
            console.log("::::::::::::::::::::", { questionDtoEx });
            if (questionDto) {
              question = new Question(questionDto).question;
              console.log('Question successfully modified')
              //dispatch({ type: ActionTypes.SET_QUESTION, payload: { question: assignedAnswer } });
              //dispatch({ type: ActionTypes.CLOSE_QUESTION_FORM })
            }
          });
        if (question) {
          dispatch({ type: ActionTypes.SET_QUESTION_AFTER_ASSIGN_ANSWER, payload: { question } });
        }
        /*
        const assignedAnswers = [...question.assignedAnswers, newAssignedAnwser];
        const obj: IQuestion = {
          ...question,
          assignedAnswers,
          numOfAssignedAnswers: assignedAnswers.length
        }
        await dbp!.put('Questions', obj, questionId);
        console.log("Question Answer successfully assigned", obj);
        */
        ///////////////////
        // newAssignedAnwser.answer.title = answer.title;
        // obj.assignedAnswers = [...question.assignedAnswers, newAssignedAnwser];;
        // dispatch({ type: ActionTypes.SET_QUESTION, payload: { question: obj } });
        //dispatch({ type: ActionTypes.SET_QUESTION_AFTER_ASSIGN_ANSWER, payload: { question: { ...obj } } });
      }
      catch (error: any) {
        console.log('error', error);
        dispatch({ type: ActionTypes.SET_ERROR, payload: { error } });
      }
    }, [Execute, KnowledgeAPI.endpointQuestionAnswer, nickName, workspace]);


  const onCategoryTitleChanged = useCallback(
    (topRow: ICategoryRow, id: string, title: string): void => {
      //const { topRows } = state;
      //const topRow: ICategoryRow = topRows.find(c => c.id === topId)!;
      //const categoryRow: ICategoryRow = findCategoryRow(topRow.categoryRows, id)!;
      if (!activeCategory || state.loadingCategory) // just in case
        return;
      // const categoryRow: ICategoryRow = (topRow.id === id)
      //   ? topRow
      //   : findCategoryRow(topRow.categoryRows, id)!;
      let categoryRow: ICategoryRow | null = findCategoryRow(topRow, id)!;
      if (categoryRow && categoryRow.title !== title) {
        console.log(ActionTypes.CATEGORY_TITLE_CHANGED, 'Sent>>>>>>>>>>:', categoryRow.title, title)
        categoryRow.title = title;
        // rerender
        //console.log(ActionTypes.CATEGORY_TITLE_CHANGED, 'Sent>>>>>>>>>>:', categoryRow.title)
        dispatch({ type: ActionTypes.CATEGORY_TITLE_CHANGED, payload: { categoryRow } })
      }
    }, [activeCategory, findCategoryRow, state.loadingCategory])


  const onQuestionTitleChanged = useCallback(
    (topRow: ICategoryRow, categoryId: string, id: string, title: string): void => {
      //const { categoryRows } = topRow;
      //const categoryRow: ICategoryRow = findCategoryRow(categoryRows, categoryId)!;
      const categoryRow: ICategoryRow = (topRow.id === categoryId)
        ? topRow
        : findCategoryRow(topRow, categoryId)!;
      if (categoryRow) {
        const questionRow = categoryRow.questionRows.find(q => q.id === id)!;
        console.log(categoryRow.questionRows, id)
        questionRow.title = title;
      }
      // rerender
      dispatch({ type: ActionTypes.QUESTION_TITLE_CHANGED, payload: { categoryRow } })
    }, [findCategoryRow])

  const contextValue: ICategoriesContext = {
    state, loadAllCategoryRows, openNode, loadTopRows,
    addSubCategory, cancelAddCategory, createCategory,
    viewCategory, editCategory, updateCategory, deleteCategory, deleteCategoryVariation,
    expandCategory, collapseCategory, onCategoryTitleChanged,
    loadCategoryQuestions,
    addQuestion, cancelAddQuestion, createQuestion,
    viewQuestion, editQuestion, updateQuestion, deleteQuestion, onQuestionTitleChanged,
    assignQuestionAnswer
  }

  if (!isAuthenticated || !allCategoryRowsLoaded || keyExpanded === null)
    return null;

  return (
    <CategoriesContext.Provider value={contextValue}>
      <CategoryDispatchContext.Provider value={dispatch}>
        {children}
      </CategoryDispatchContext.Provider>
    </CategoriesContext.Provider>
  );
}

export function useCategoryContext() {
  return useContext(CategoriesContext);
}

export const useCategoryDispatch = () => {
  return useContext(CategoryDispatchContext)
};

