import { useGlobalState, useGlobalContext } from 'global/GlobalProvider'
import React, { createContext, useContext, useReducer, useCallback, Dispatch } from 'react';

import {
  ActionTypes, ICategory, IQuestion, ICategoriesContext, IFromUserAssignedAnswer,
  ICategoryDto, ICategoryDtoEx, ICategoryDtoListEx, ICategoryKey, ICategoryKeyExtended,
  CategoryKey, Category, CategoryDto,
  IQuestionDto, IQuestionDtoEx, IQuestionEx, IQuestionRowDto, IQuestionKey, IQuestionRow,
  Question, QuestionDto, QuestionRow,
  QuestionRowDto,
  IParentInfo,
  ICategoryRow,
  ICategoryRowDtoEx,
  CategoryRow,
  ICategoryRowDto,
  ILoadCategoryQuestions,
  QuestionKey,
  FormMode,
  CategoryRowDto,
  IExpandInfo,
  ICategoryKeyExpanded,
  IAssignedAnswerKey,
  QuestionKeyDto
} from 'categories/types';

import { initialCategoriesState, CategoryReducer, initialQuestion, initialCategory } from 'categories/CategoryReducer';
import { IWhoWhen, Dto2WhoWhen, WhoWhen2Dto } from 'global/types';
import { IAnswer, IAnswerKey, IGroup } from 'groups/types';
import { IAssignedAnswer, IAssignedAnswerDto, IAssignedAnswerDtoEx, AssignedAnswer, AssignedAnswerDto } from 'categories/types';
import { protectedResources } from 'authConfig';

const CategoriesContext = createContext<ICategoriesContext>({} as any);
const CategoryDispatchContext = createContext<Dispatch<any>>(() => null);

type Props = {
  children: React.ReactNode
}

export const CategoryProvider: React.FC<Props> = ({ children }) => {

  const { loadAndCacheAllCategoryRows, getCat, setNodesReloaded } = useGlobalContext()
  const globalState = useGlobalState();
  const { workspace, dbp, allCategoryRows, authUser, canEdit } = globalState;
  const { nickName } = authUser;

  const [state, dispatch] = useReducer(CategoryReducer, initialCategoriesState);
  const { formMode, activeCategory, activeQuestion } = state;

  console.log('----->>> CategoryProvider')


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

  const loadTopRows = useCallback(async () => {
    return new Promise(async (resolve) => {
      const { keyExpanded } = state;
      try {
        dispatch({ type: ActionTypes.SET_TOP_ROWS_LOADING, payload: {} });
        const url = `${protectedResources.KnowledgeAPI.endpointCategoryRow}/${workspace}/null`;
        console.log('CategoryProvider loadTopRows url:', url)
        console.time();
        await Execute("GET", url)
          .then((dtos: ICategoryRowDto[]) => {
            console.timeEnd();
            const topRows = dtos!.map((dto: ICategoryRowDto) => {
              dto.IsExpanded = keyExpanded
                ? dto.Id === keyExpanded.id
                : false;
              //dto.TopId = dto.QuestionId;
              return new CategoryRow(dto).categoryRow;
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
    async (catKeyExp: ICategoryKeyExpanded, fromChatBotDlg: string = 'false'): Promise<any> => {
      return new Promise(async (resolve) => {
        try {
          let { topId, id, parentId } = catKeyExp;
          console.assert(id);
          if (id) {
            const categoryRow: ICategoryRow | undefined = allCategoryRows.get(id);
            if (categoryRow) {
              catKeyExp.topId = categoryRow.topId;
            }
            else {
              alert('reload all categoryRow:' + id)
              //return
            }
          }
          dispatch({ type: ActionTypes.NODE_OPENING, payload: { fromChatBotDlg: fromChatBotDlg === 'true' } })
          // ---------------------------------------------------------------------------
          console.time();
          const query = new CategoryKey(catKeyExp).toQuery(workspace);
          const url = `${protectedResources.KnowledgeAPI.endpointCategoryRow}?${query}`;
          await Execute("GET", url)
            .then(async (categoryRowDtoEx: ICategoryRowDtoEx) => {
              //dispatch({ type: ActionTypes.CLEAN_SUB_TREE, payload: { categoryKey: categoryKey! } });
              const { categoryRowDto, msg } = categoryRowDtoEx;
              console.timeEnd();
              if (categoryRowDto) {
                const categoryRow = new CategoryRow(categoryRowDto).categoryRow; // deep clone dto
                dispatch({
                  type: ActionTypes.SET_NODE_OPENED, payload: {
                    keyExpanded: catKeyExp,
                    categoryRow,
                    //questionId: catKeyExp.questionId,
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


  // get category With subcategoryRows and questionRows
  const getCategory = async (categoryKey: ICategoryKey, includeQuestionId: string | null): Promise<any> => {
    const { topId, id } = categoryKey;
    console.log({ categoryKey, includeQuestionId })
    return new Promise(async (resolve) => {
      try {
        const url = `${protectedResources.KnowledgeAPI.endpointCategory}/${workspace}/${topId}/${id}/${PAGE_SIZE}/${includeQuestionId}`;
        console.time()
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
  }

  const getCategoryRow = async (categoryKey: ICategoryKey, hidrate: boolean = false, includeQuestionId: string | null = null): Promise<any> => {
    const query = new CategoryKey(categoryKey).toQuery(workspace);
    return new Promise(async (resolve) => {
      try {
        const url = `${protectedResources.KnowledgeAPI.endpointCategoryRow}/${hidrate}/${PAGE_SIZE}/${includeQuestionId}?${query}`;
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
  }

  const expandCategory = useCallback(
    async ({ topId, categoryKey, includeQuestionId, newCategoryRow, newQuestion, formMode }: IExpandInfo): Promise<any> => {
      try {
        const { keyExpanded } = state;
        dispatch({ type: ActionTypes.SET_ROW_EXPANDING, payload: {} });
        const categoryRow: ICategoryRow | Error = await getCategoryRow(categoryKey, true, includeQuestionId); // to reload Category
        if (categoryRow instanceof Error) {
          dispatch({ type: ActionTypes.SET_ERROR, payload: { error: categoryRow } });
          console.error({ cat: categoryRow })
        }
        else {
          console.log('getCategory vratio:', categoryRow)
          if (newCategoryRow) {
            categoryRow.categoryRows = [newCategoryRow, ...categoryRow.categoryRows];
          }

          if (newQuestion) {
            categoryRow.questionRows = [newQuestion, ...categoryRow.questionRows];
          }
          categoryRow.isExpanded = true;
          if (formMode === FormMode.None && includeQuestionId) {
            formMode = canEdit ? FormMode.EditingQuestion : FormMode.ViewingQuestion
          }

          dispatch({ type: ActionTypes.SET_ROW_EXPANDED, payload: { categoryRow, formMode: formMode! } });
          return categoryRow;
        }
      }
      catch (error: any) {
        console.log('error', error);
        dispatch({ type: ActionTypes.SET_ERROR, payload: { error } });
        return null;
      }
    }, [dispatch]);


  const collapseCategory = useCallback(
    async (categoryRow: ICategoryRow) => {
      const { topId: topId } = categoryRow;
      const categoryKey = new CategoryKey(categoryRow).categoryKey!;
      try {
        dispatch({ type: ActionTypes.SET_ROW_COLLAPSING, payload: {} });
        const categoryRow: ICategoryRow | Error = await getCategoryRow(categoryKey); // no subCategoryRows and no questionRows
        // .then(async (category: ICategory) => {
        if (categoryRow instanceof Error) {
          dispatch({ type: ActionTypes.SET_ERROR, payload: { error: categoryRow } });
          console.error({ cat: categoryRow })
        }
        else {
          categoryRow.topId = topId;
          categoryRow.isExpanded = false;
          dispatch({ type: ActionTypes.SET_ROW_COLLAPSED, payload: { categoryRow } });
          return categoryKey;
        }
      }
      catch (error: any) {
        console.log('error', error);
        dispatch({ type: ActionTypes.SET_ERROR, payload: { error } });
      }
    }, [dispatch]);


  const addSubCategory = useCallback(
    async (categoryRow: ICategoryRow) => {
      try {
        const { topId, parentId, id, level, isExpanded, categoryRows } = categoryRow;
        const categoryKey: ICategoryKey = { topId, parentId, id };
        const newCategoryRow: ICategoryRow = {
          ...initialCategory,
          topId: 'newCategoryId',
          id: 'newCategoryId', // backEnd will generate id
          parentId: id,
          level,
          title: 'new Category'
        }
        const expandInfo: IExpandInfo = {
          topId: topId!,
          categoryKey,
          formMode: FormMode.AddingCategory,
          newCategoryRow
        }

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
          const row: ICategoryRow | null = await expandCategory(expandInfo);
          if (row) {
            const category: ICategory = {
              ...newCategoryRow,
              doc1: ''
            }
            dispatch({ type: ActionTypes.SET_CATEGORY, payload: { categoryRow: category } });
          }

        }
      }
      catch (error: any) {
        console.log('error', error);
        dispatch({ type: ActionTypes.SET_ERROR, payload: { error } });
      }
    }, [dispatch]);


  const cancelAddCategory = useCallback(
    async () => {
      try {
        const { topId, id, parentId } = activeCategory!;
        const categoryKey: ICategoryKey = { topId, parentId, id }; // TODO proveri

        const expandInfo: IExpandInfo = {
          topId: topId!,
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
    }, [dispatch, activeCategory]);


  const createCategory = useCallback(
    async (category: ICategory) => {
      const { topId, id, parentId, variations, title, kind, modified } = category;
      dispatch({ type: ActionTypes.SET_LOADING_CATEGORY, payload: {} });
      try {
        const categoryDto = new CategoryDto(category).categoryDto;
        console.log("categoryDto", { categoryDto })
        const url = `${protectedResources.KnowledgeAPI.endpointCategory}/${workspace}`;
        console.time()
        await Execute("POST", url, categoryDto, id)
          .then(async (categoryDtoEx: ICategoryDtoEx) => {   //  | null
            console.timeEnd();
            const { categoryDto } = categoryDtoEx;
            if (categoryDto) {
              categoryDto.TopId = topId!;
              const category = new Category(categoryDto).category;
              console.log('Category successfully created', { category })
              await loadAndCacheAllCategoryRows()
                .then(async (done: boolean) => {
                  const parentCategoryKey: ICategoryKey = { topId, parentId, id: parentId! };
                  const expandInfo: IExpandInfo = {
                    topId: topId!,
                    categoryKey: parentCategoryKey,
                    formMode: FormMode.AddingCategory
                  }
                  await expandCategory(expandInfo).then(() => {
                    //dispatch({ type: ActionTypes.SET_CATEGORY, payload: { categoryRow: category } }); // ICategory extends ICategory Row
                    dispatch({ type: ActionTypes.SET_CATEGORY_ADDED, payload: { categoryRow: category } }); // ICategory extends ICategory Row
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
  }, [dispatch, formMode]);


  const editCategory = useCallback(async (categoryRow: ICategoryRow, includeQuestionId: string | null) => {
    const { topId, id, parentId } = categoryRow;
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
      if (parentId === null) { // topRow
        category.topId = categoryRow.topId;
        dispatch({ type: ActionTypes.SET_CATEGORY_TO_EDIT, payload: { categoryRow: category } });
      }
      else {
        const parentKey: ICategoryKey = { topId, parentId, id: parentId }
        // get acurate info from server (children will be collapsed)
        const expandInfo: IExpandInfo = {
          topId: topId!,
          categoryKey: parentKey,
          formMode: FormMode.EditingCategory
        }
        await expandCategory(expandInfo).then(() => {
          category.topId = categoryRow.topId;
          dispatch({ type: ActionTypes.SET_CATEGORY_TO_EDIT, payload: { categoryRow: category } });
        })
      }
    }
  }, [dispatch, formMode]);


  const updateCategory = useCallback(
    async (category: ICategory, closeForm: boolean) => {
      const { topId, id, variations, title, kind, modified } = category;
      dispatch({ type: ActionTypes.SET_LOADING_CATEGORY, payload: {} });
      try {
        const categoryDto = new CategoryDto(category).categoryDto;
        const url = `${protectedResources.KnowledgeAPI.endpointCategory}/${workspace}`;
        console.time()
        await Execute("PUT", url, categoryDto)
          .then((response: ICategoryDtoEx | Response) => {
            console.timeEnd();
            if (response instanceof Response) {
              console.error(response);
              dispatch({ type: ActionTypes.SET_ERROR, payload: { error: new Error('Server Error') } });
            }
            else {
              const { categoryDto, msg } = response as ICategoryDtoEx;
              if (categoryDto) {
                const category = new Category(categoryDto).category;
                const { topId, id } = category;
                category.isExpanded = false;
                category.topId = topId;
                dispatch({ type: ActionTypes.SET_CATEGORY_UPDATED, payload: { categoryRow: category } });
                if (closeForm) {
                  dispatch({ type: ActionTypes.CLOSE_CATEGORY_FORM, payload: {} })
                }
              }
              else {
                dispatch({ type: ActionTypes.SET_ERROR, payload: { error: new Error(`Category ${id} not found!`) } });
              }
            }
          });
      }
      catch (error: any) {
        console.log(error)
        return error;
      }
    }, [dispatch]);


  const deleteCategory = useCallback(async (categoryRow: ICategoryRow) => {
    //dispatch({ type: ActionTypes.SET_CATEGORY_LOADING, payload: { id, loading: false } });
    try {
      const { topId, id, parentId } = categoryRow;
      const parentCategoryKey: ICategoryKey = { topId, parentId, id };
      const categoryDto = new CategoryRowDto(categoryRow).categoryRowDto;
      const url = `{protectedResources.KnowledgeAPI.endpointCategory}/${workspace}`;
      console.time()
      await Execute("DELETE", url, categoryDto)    //Modified: {  Time: new Date(), NickName: globalState.authUser.nickName }
        .then(async (response: ICategoryDtoEx | Response) => {
          console.timeEnd();
          if (response instanceof Response) {
            console.error({ response });
            if (response.status == 404) {
              dispatch({ type: ActionTypes.SET_ERROR, payload: { error: new Error('Category Not Found'), whichRowId: id } });
            }
          }
          else {
            const { categoryDto, msg } = response as ICategoryDtoEx;
            if (msg === "OK") {
              // await loadAndCacheAllCategoryRows(); // reload
              console.log('Category successfully deleted', { categoryRow })
              await loadAndCacheAllCategoryRows()
                .then(async (done: boolean) => {
                  const expandInfo: IExpandInfo = {
                    topId: topId!,
                    categoryKey: parentCategoryKey,
                    formMode: FormMode.None
                  }
                  await expandCategory(expandInfo).then(() => {
                    // dispatch({ type: ActionTypes.DELETE_CATEGORY, payload: { id: categoryDto!.Id } });
                    // dispatch({ type: ActionTypes.SET_CATEGORY, payload: { categoryRow: category } }); // ICategory extends ICategory Row
                  });
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
          }
        })
    }
    catch (error: any) {
      console.log(error)
      return error;
    }
  }, [dispatch]);


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
      const { topId, parentId, id } = categoryKey;
      dispatch({ type: ActionTypes.SET_CATEGORY_QUESTIONS_LOADING, payload: { loadingQuestion: true } })
      try {
        const url = `${protectedResources.KnowledgeAPI.endpointQuestion}/${workspace}/${topId}/${id}/${startCursor}/${PAGE_SIZE}/${includeQuestionId}`;
        console.time()
        console.log('>>>>>>>>>>>>loadCategoryQuestions URL:', { url }, { includeQuestionId })
        await Execute!("GET", url).then((categoryDtoEx: ICategoryDtoEx) => {
          console.timeEnd();
          const { categoryDto, msg } = categoryDtoEx;
          console.log('>>>>>>>>>>>>loadCategoryQuestions categoryDto:', { categoryDto })
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
  }, [dispatch]);


  const addQuestion = useCallback(
    async (categoryKey: ICategoryKey, topId: string) => {
      try {
        //const { topId, id, questionRows } = categoryRow;
        //const categoryKey: ICategoryKey = {topId, id};
        const { topId, id } = categoryKey;
        const cat: ICategoryRow | undefined = await getCat(id!);
        const newQuestion: IQuestionRow = {
          ...initialQuestion,
          topId,
          id: 'generateId', // backEnd will generate id
          title: 'new Question',
          parentId: id
        }

        const expandInfo: IExpandInfo = {
          topId: topId,
          categoryKey,
          formMode: FormMode.AddingQuestion,
          newCategoryRow: undefined,
          newQuestion
        }
        const categoryRow: ICategoryRow | null = await expandCategory(expandInfo);
        if (categoryRow) {
          const question: IQuestion = {
            ...newQuestion,
            categoryTitle: cat ? cat.title : 'Jok Parent Title',
            numOfAssignedAnswers: 0,
            assignedAnswers: [],
            numOfRelatedFilters: 0,
            relatedFilters: [],
            source: 0,
            status: 0
          }
          dispatch({ type: ActionTypes.SET_QUESTION, payload: { question, formMode: FormMode.AddingQuestion } });
        }
      }
      catch (error: any) {
        console.log('error', error);
        dispatch({ type: ActionTypes.SET_ERROR, payload: { error } });
      }
    }, [dispatch]);

  const cancelAddQuestion = useCallback(
    async () => {
      try {
        const { topId, parentId } = activeQuestion!;
        const categoryKey: ICategoryKey = { topId, parentId, id: parentId! };
        const expandInfo: IExpandInfo = {
          topId: topId,
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
    }, [dispatch, activeQuestion]);


  const createQuestion = useCallback(
    async (question: IQuestion) => {
      const { topId, id, title, modified, parentId } = question;
      // TODO
      dispatch({ type: ActionTypes.SET_LOADING_CATEGORY, payload: {} });
      try {
        question.created!.nickName = nickName;
        const questionDto = new QuestionDto(question).questionDto;
        const url = `${protectedResources.KnowledgeAPI.endpointQuestion}/${workspace}`;
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
                await loadAndCacheAllCategoryRows() // numOfQuestions changed
                  .then(async (done: boolean) => {
                    const parentCategoryKey: ICategoryKey = { topId, parentId, id: parentId! };
                    const expandInfo: IExpandInfo = {
                      topId: topId,
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
    }, [dispatch]);


  const updateQuestion = useCallback(
    async (oldParentId: string, newQuestion: IQuestion, categoryChanged: boolean) => {
      const { topId, id, title, modified, parentId } = newQuestion;
      // dispatch({ type: ActionTypes.SET_CATEGORY_LOADING, payload: { id: parentId!, loading: false } });
      try {
        newQuestion.modified!.nickName = nickName;
        const questionDto = new QuestionDto(newQuestion).questionDto;
        const url = `${protectedResources.KnowledgeAPI.endpointQuestion}/${workspace}`;
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
                const keyExpanded: ICategoryKeyExpanded = {
                  topId,
                  parentId: '', // proveri
                  id: parentId!,
                  questionId: id
                }
                dispatch({ type: ActionTypes.FORCE_OPEN_NODE, payload: { keyExpanded } })
              }
              else {
                const parentCategoryKey: ICategoryKey = { topId, parentId, id: parentId! }; // proveri
                const expandInfo: IExpandInfo = {
                  topId: topId,
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
    }, [dispatch]);


  const deleteQuestion = useCallback(
    async (questionRow: IQuestionRow) => {
      const { id, title, modified, parentId, topId } = questionRow;
      dispatch({ type: ActionTypes.SET_LOADING_CATEGORY, payload: {} });
      try {
        const questionDto = new QuestionRowDto(questionRow).questionRowDto;
        const url = `${protectedResources.KnowledgeAPI.endpointQuestion}/${workspace}`;
        console.time()
        await Execute("DELETE", url, questionDto)
          .then(async (questionDtoEx: IQuestionDtoEx) => {
            const { questionDto, msg } = questionDtoEx;
            console.timeEnd();
            if (questionDto) {
              const question = new Question(questionDto).question;
              console.log('Question successfully deleted')
              dispatch({ type: ActionTypes.DELETE_QUESTION, payload: { question } });
              /*
              //dispatch({ type: ActionTypes.CLOSE_QUESTION_FORM })
              await loadAndCacheAllCategoryRows(); // reload
              */
              const parentCategoryKey: ICategoryKey = { topId, parentId, id: parentId! }; // proveri
              const expandInfo: IExpandInfo = {
                topId: topId,
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
    }, [dispatch]);


  const getQuestion = async (questionKey: IQuestionKey): Promise<any> => {
    return new Promise(async (resolve) => {
      try {
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
  }, []);


  const editQuestion = useCallback(async (questionRow: IQuestionRow) => {
    const questionKey: IQuestionKey = new QuestionKey(questionRow).questionKey!;
    if (formMode === FormMode.AddingQuestion) {
      await cancelAddQuestion();
    }
    else if (formMode === FormMode.AddingCategory) {
      await cancelAddCategory();
    }
    dispatch({ type: ActionTypes.SET_LOADING_QUESTION, payload: {} });
    const questionEx: IQuestionEx = await getQuestion(questionKey!);
    const { question, msg } = questionEx;
    if (question) {
      // we don't reload categoryRows, just use isSelected from activeQuestion
      question.topId = questionRow.topId;
      dispatch({ type: ActionTypes.SET_QUESTION_TO_EDIT, payload: { question } });
    }
    else
      dispatch({ type: ActionTypes.SET_ERROR, payload: { error: new Error(msg) } });
  }, []);


  // action: 'Assign' or 'UnAssign'
  const assignQuestionAnswer = useCallback(async (action: 'Assign' | 'UnAssign', questionKey: IQuestionKey, assignedAnswerKey: IAssignedAnswerKey): Promise<any> => {
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
      dto.QuestionKeyDto = new QuestionKeyDto(questionKey).dto;
      dto.QuestionKeyDto.Workspace = workspace;
      let question: IQuestion | null = null;
      const url = `${protectedResources.KnowledgeAPI.endpointQuestionAnswer}/${action}`;
      console.time()
      await Execute("POST", url, dto)
        .then(async (questionDtoEx: IQuestionDtoEx) => {
          console.timeEnd();
          const { questionDto, msg } = questionDtoEx;
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
  }, []);



  const contextValue: ICategoriesContext = {
    state, openNode, loadTopRows,
    addSubCategory, cancelAddCategory, createCategory,
    viewCategory, editCategory, updateCategory, deleteCategory, deleteCategoryVariation,
    expandCategory, collapseCategory,
    loadCategoryQuestions,
    addQuestion, cancelAddQuestion, createQuestion,
    viewQuestion, editQuestion, updateQuestion, deleteQuestion,
    assignQuestionAnswer
  }
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

