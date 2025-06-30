import { useGlobalState, useGlobalContext } from 'global/GlobalProvider'
import React, { createContext, useContext, useReducer, useCallback, Dispatch } from 'react';

import {
  ActionTypes, ICategory, IQuestion, ICategoriesContext, IFromUserAssignedAnswer,
  ICategoryDto, ICategoryDtoEx, ICategoryDtoListEx, ICategoryKey, ICategoryKeyExtended, ICategoryKeyExpanded,
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
  IExpandInfo
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
  const { dbp, categoryRows, authUser, canEdit } = globalState;
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

  const loadFirstLevelCategoryRows = useCallback(async () => {
    return new Promise(async (resolve) => {
      const { categoryKeyExpanded } = state;
      try {
        dispatch({ type: ActionTypes.SET_LOADING, payload: {} });
        const url = `${protectedResources.KnowledgeAPI.endpointCategoryRow}/null/null`;
        console.log('CategoryProvider loadFirstLevelCategoryRows url:', url)
        console.time();
        await Execute("GET", url)
          .then((dtos: ICategoryRowDto[]) => {
            console.timeEnd();
            const topCategoryRows = dtos!.map((dto: ICategoryRowDto) => {
              dto.IsExpanded = categoryKeyExpanded
                ? dto.Id === categoryKeyExpanded.id
                : false;
              dto.RootId = dto.Id;
              return new CategoryRow(dto).categoryRow;
            })
            dispatch({ type: ActionTypes.SET_TOP_CATEGORY_ROWS, payload: { topCategoryRows } });
            resolve(topCategoryRows);
          });
      }
      catch (error: any) {
        console.log(error)
        dispatch({ type: ActionTypes.SET_ERROR, payload: { error } });
      }
    })
  }, [dispatch]);


  const openCategoryNode = useCallback(
    async (catKeyExp: ICategoryKeyExpanded, fromChatBotDlg: string = 'false'): Promise<any> => {
      return new Promise(async (resolve) => {
        try {
          console.log('---CategoryProvider.openCategoryNode categoryKeyExpanded:', catKeyExp)
          let { id, partitionKey } = catKeyExp;
          console.assert(id);
          if (id && partitionKey === '') {
            const categoryRow: ICategoryRow | undefined = categoryRows.get(id);
            console.log("rrrrrrrrrrrrrrrrropenCategoryNode", id, categoryRow)
            if (categoryRow) {
              catKeyExp.partitionKey = categoryRow.partitionKey;
              partitionKey = categoryRow.partitionKey;
            }
            else {
              alert('reload all categoryRow:' + id)
              //return
            }
          }
          dispatch({ type: ActionTypes.CATEGORY_NODE_OPENING, payload: {} })
          // ---------------------------------------------------------------------------
          console.time();
          const url = `${protectedResources.KnowledgeAPI.endpointCategoryRow}/${partitionKey}/${id}/true`;
          console.log('calling CatController.GetCatsUpTheTree', url)
          await Execute("GET", url)
            .then(async (categoryRowDtoEx: ICategoryRowDtoEx) => {
              //dispatch({ type: ActionTypes.CLEAN_SUB_TREE, payload: { categoryKey: categoryKey! } });
              const { categoryRowDto, msg } = categoryRowDtoEx;
              console.timeEnd();
              if (categoryRowDto) {
                const categoryRow = new CategoryRow(categoryRowDto).categoryRow; // deep clone dto
                dispatch({
                  type: ActionTypes.SET_CATEGORY_NODE_OPENED, payload: {
                    // categoryKeyExpanded: catKeyExp,
                    categoryRow,
                    questionId: catKeyExp.questionId,
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
    const { partitionKey, id } = categoryKey;
    console.log({ categoryKey, includeQuestionId })
    return new Promise(async (resolve) => {
      try {
        const url = `${protectedResources.KnowledgeAPI.endpointCategory}/${partitionKey}/${id}/${PAGE_SIZE}/${includeQuestionId}`;
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

  const getCategoryRow = async (rootId: string, categoryKey: ICategoryKey, hidrate: boolean = false, includeQuestionId: string | null = null): Promise<any> => {
    const { partitionKey, id } = categoryKey;
    console.log({ categoryKey, includeQuestionId })
    return new Promise(async (resolve) => {
      try {
        const url = `${protectedResources.KnowledgeAPI.endpointCategoryRow}/${partitionKey}/${id}/${hidrate}/${PAGE_SIZE}/${includeQuestionId}`;
        console.time()
        await Execute("GET", url)
          .then((categoryRowDtoEx: ICategoryRowDtoEx) => {
            console.timeEnd();
            const { categoryRowDto, msg } = categoryRowDtoEx;
            if (categoryRowDto) {
              categoryRowDto.RootId = rootId;
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
    async ({ rootId, categoryKey, includeQuestionId, newCategoryRow, newQuestion, formMode }: IExpandInfo): Promise<any> => {
      try {
        const { categoryKeyExpanded } = state;
        const { questionId } = categoryKeyExpanded!;

        const categoryRow: ICategoryRow | Error = await getCategoryRow(rootId, categoryKey, true, includeQuestionId); // to reload Category
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

          dispatch({ type: ActionTypes.SET_CATEGORY_ROW_EXPANDED, payload: { categoryRow, formMode: formMode! } });
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
      const { rootId } = categoryRow;
      const categoryKey = new CategoryKey(categoryRow).categoryKey!;
      try {
        const categoryRow: ICategoryRow | Error = await getCategoryRow(rootId!, categoryKey); // no subCategoryRows and no questionRows
        // .then(async (category: ICategory) => {
        if (categoryRow instanceof Error) {
          dispatch({ type: ActionTypes.SET_ERROR, payload: { error: categoryRow } });
          console.error({ cat: categoryRow })
        }
        else {
          categoryRow.rootId = rootId;
          categoryRow.isExpanded = false;
          dispatch({ type: ActionTypes.SET_CATEGORY_ROW_COLLAPSED, payload: { categoryRow } });
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
        const { rootId, partitionKey, id, level, isExpanded, categoryRows } = categoryRow;
        const categoryKey: ICategoryKey = { partitionKey, id };
        const newCategoryRow: ICategoryRow = {
          ...initialCategory,
          rootId,
          partitionKey: 'newCategoryId',
          id: 'newCategoryId', // backEnd will generate id
          parentCategory: id,
          level,
          title: 'new Category'
        }
        const expandInfo: IExpandInfo = {
          rootId: rootId!,
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
          dispatch({ type: ActionTypes.SET_CATEGORY_ROW_EXPANDED, payload: { categoryRow: categoryRow2, formMode: FormMode.AddingCategory } });
          dispatch({ type: ActionTypes.SET_CATEGORY, payload: { categoryRow: { ...newCategoryRow, doc1: '' }} });
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
        const { rootId, partitionKey, parentCategory } = activeCategory!;
        const categoryKey: ICategoryKey = { partitionKey, id: parentCategory };

        const expandInfo: IExpandInfo = {
          rootId: rootId!,
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
      const { partitionKey, id, parentCategory, variations, title, kind, modified, rootId } = category;
      dispatch({ type: ActionTypes.SET_CATEGORY_LOADING, payload: { id, loading: false } });
      try {
        const categoryDto = new CategoryDto(category).categoryDto;
        console.log("categoryDto", { categoryDto })
        const url = `${protectedResources.KnowledgeAPI.endpointCategory}`;
        console.time()
        await Execute("POST", url, categoryDto, id)
          .then(async (categoryDtoEx: ICategoryDtoEx) => {   //  | null
            console.timeEnd();
            const { categoryDto } = categoryDtoEx;
            if (categoryDto) {
              categoryDto.RootId = rootId!;
              const category = new Category(categoryDto).category;
              console.log('Category successfully created', { category })
              await loadAndCacheAllCategoryRows()
                .then(async (done: boolean) => {
                  const parentCategoryKey: ICategoryKey = { partitionKey: parentCategory, id: parentCategory };
                  const expandInfo: IExpandInfo = {
                    rootId: rootId!,
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

    dispatch({ type: ActionTypes.SET_LOADING, payload: { categoryRow } });
    const categoryKey = new CategoryKey(categoryRow).categoryKey!;
    const category: ICategory = await getCategory(categoryKey, includeQuestionId);
    if (category instanceof Error)
      dispatch({ type: ActionTypes.SET_ERROR, payload: { error: category } });
    else {
      category.rootId = categoryRow.rootId;
      dispatch({ type: ActionTypes.SET_CATEGORY_TO_VIEW, payload: { categoryRow: category } });
    }
  }, [dispatch, formMode]);


  const editCategory = useCallback(async (categoryRow: ICategoryRow, includeQuestionId: string | null) => {
    if (formMode === FormMode.AddingQuestion) {
      await cancelAddQuestion();
    }
    else if (formMode === FormMode.AddingCategory) {
      await cancelAddCategory();
    }
    dispatch({ type: ActionTypes.SET_LOADING, payload: {} });
    const categoryKey = new CategoryKey(categoryRow).categoryKey!;
    const category: ICategory = await getCategory(categoryKey, includeQuestionId);
    if (category instanceof Error)
      dispatch({ type: ActionTypes.SET_ERROR, payload: { error: category } });
    else {
      category.rootId = categoryRow.rootId;
      dispatch({ type: ActionTypes.SET_CATEGORY_TO_EDIT, payload: { categoryRow: category } });
    }
  }, [dispatch, formMode]);


  const updateCategory = useCallback(
    async (category: ICategory, closeForm: boolean) => {
      const { partitionKey, id, variations, title, kind, modified, rootId } = category;
      dispatch({ type: ActionTypes.SET_CATEGORY_LOADING, payload: { id, loading: false } });
      try {
        const categoryDto = new CategoryDto(category).categoryDto;
        const url = protectedResources.KnowledgeAPI.endpointCategory;
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
                const { id, partitionKey } = category;
                category.isExpanded = false;
                category.rootId = rootId;
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
      const { partitionKey, id, parentCategory, rootId } = categoryRow;
      const parentCategoryKey: ICategoryKey = { partitionKey: parentCategory, id: parentCategory };
      const categoryDto = new CategoryRowDto(categoryRow).categoryRowDto;
      const url = protectedResources.KnowledgeAPI.endpointCategory;
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
                    rootId: rootId!,
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
      const { partitionKey, id } = categoryKey;
      dispatch({ type: ActionTypes.SET_CATEGORY_QUESTIONS_LOADING, payload: { questionLoading: true } })
      try {
        const url = `${protectedResources.KnowledgeAPI.endpointQuestion}/${partitionKey}/${id}/${startCursor}/${PAGE_SIZE}/${includeQuestionId}`;
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
            //   type: ActionTypes.LOAD_CATEGORY_QUESTIONS,
            //   payload: { id, questionRows, hasMoreQuestions: HasMoreQuestions! }
            // });
            dispatch({
              type: ActionTypes.LOAD_CATEGORY_QUESTIONS,
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
    async (categoryKey: ICategoryKey, rootId: string) => {
      try {
        //const { rootId, partitionKey, id, questionRows } = categoryRow;
        //const categoryKey: ICategoryKey = {partitionKey, id};
        const { partitionKey, id } = categoryKey;
        const cat: ICategoryRow | undefined = await getCat(id!);
        const newQuestion: IQuestionRow = {
          ...initialQuestion,
          rootId,
          id: 'generateId', // backEnd will generate id
          title: 'new Question',
          partitionKey: id ?? '',
          parentCategory: id
        }

        const expandInfo: IExpandInfo = {
          rootId,
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
        const { rootId, partitionKey, parentCategory } = activeQuestion!;
        const categoryKey: ICategoryKey = { partitionKey, id: parentCategory };
        const expandInfo: IExpandInfo = {
          rootId,
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
      const { partitionKey, id, title, modified, parentCategory, rootId } = question;
      // TODO
      dispatch({ type: ActionTypes.SET_CATEGORY_LOADING, payload: { id: parentCategory!, loading: false } });
      try {
        question.created!.nickName = nickName;
        const questionDto = new QuestionDto(question).questionDto;
        const url = `${protectedResources.KnowledgeAPI.endpointQuestion}`;
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
                question.rootId = rootId;
                console.log('Question successfully created')
                //dispatch({ type: ActionTypes.CLOSE_QUESTION_FORM })
                await loadAndCacheAllCategoryRows() // numOfQuestions changed
                  .then(async (done: boolean) => {
                    const parentCategoryKey: ICategoryKey = { partitionKey: parentCategory, id: parentCategory };
                    const expandInfo: IExpandInfo = {
                      rootId,
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
    async (rootId: string, oldParentCategory: string, newQuestion: IQuestion, categoryChanged: boolean) => {
      const { partitionKey, id, title, modified, parentCategory } = newQuestion;
      // dispatch({ type: ActionTypes.SET_CATEGORY_LOADING, payload: { id: parentCategory!, loading: false } });
      try {
        newQuestion.modified!.nickName = nickName;
        const questionDto = new QuestionDto(newQuestion).questionDto;
        const url = `${protectedResources.KnowledgeAPI.endpointQuestion}`;
        console.time()
        questionDto.oldParentCategory = oldParentCategory;
        console.log('>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>> updateQuestion', questionDto)
        let questionRet: IQuestion | null = null;
        await Execute("PUT", url, questionDto)
          .then(async (questionDtoEx: IQuestionDtoEx) => {
            console.timeEnd();
            const { questionDto, msg } = questionDtoEx;
            if (questionDto) {
              questionRet = new Question(questionDto).question!;
              console.log('Question successfully updated: ', questionRet)
              const { partitionKey, parentCategory } = questionRet;
              if (categoryChanged) {
                // nema koristi
                // dispatch({ type: ActionTypes.SET_QUESTION, payload: { question: questionRet } })
                const { partitionKey, parentCategory, id } = questionRet;
                const categoryKeyExpanded: ICategoryKeyExpanded = {
                  partitionKey,
                  id: parentCategory,
                  questionId: id // keep the same question
                }
                dispatch({ type: ActionTypes.FORCE_OPEN_CATEGORY_NODE, payload: { categoryKeyExpanded } })
              }
              else {
                const parentCategoryKey: ICategoryKey = { partitionKey: parentCategory, id: parentCategory };
                const expandInfo: IExpandInfo = {
                  rootId,
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
      const { partitionKey, id, title, modified, parentCategory, rootId } = questionRow;
      dispatch({ type: ActionTypes.SET_CATEGORY_LOADING, payload: { id: parentCategory!, loading: false } });
      try {
        const questionDto = new QuestionRowDto(questionRow).questionRowDto;
        const url = `${protectedResources.KnowledgeAPI.endpointQuestion}`;
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
              const parentCategoryKey: ICategoryKey = { partitionKey: parentCategory, id: parentCategory };
              const expandInfo: IExpandInfo = {
                rootId,
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
        const { partitionKey, id } = questionKey;
        const url = `${protectedResources.KnowledgeAPI.endpointQuestion}/${partitionKey}/${id}`;
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
    const questionEx: IQuestionEx = await getQuestion(questionKey!);
    if (formMode === FormMode.AddingQuestion) {
      await cancelAddQuestion();
    }
    else if (formMode === FormMode.AddingCategory) {
      await cancelAddCategory();
    }
    const { question, msg } = questionEx;
    if (question) {
      question.rootId = questionRow.rootId;
      dispatch({ type: ActionTypes.SET_QUESTION_TO_VIEW, payload: { question } });
    }
    else
      dispatch({ type: ActionTypes.SET_ERROR, payload: { error: new Error(msg) } });
  }, []);


  const editQuestion = useCallback(async (questionRow: IQuestionRow) => {
    const { partitionKey, id, parentCategory, rootId } = questionRow;
    const questionKey: IQuestionKey = { partitionKey, id };
    if (formMode === FormMode.AddingQuestion) {
      await cancelAddQuestion();
    }
    else if (formMode === FormMode.AddingCategory) {
      await cancelAddCategory();
    }
    //dispatch({ type: ActionTypes.SET_VIEWING_EDITING_QUESTION });
    const questionEx: IQuestionEx = await getQuestion(questionKey!);
    const { question, msg } = questionEx;
    if (question) {
      // we don't reload categoryRows, just use isSelected from activeQuestion
      question.rootId = questionRow.rootId;
      dispatch({ type: ActionTypes.SET_QUESTION_TO_EDIT, payload: { question } });
    }
    else
      dispatch({ type: ActionTypes.SET_ERROR, payload: { error: new Error(msg) } });
  }, []);


  // action: 'Assign' or 'UnAssign'
  const assignQuestionAnswer = useCallback(async (action: 'Assign' | 'UnAssign', questionKey: IQuestionKey, answerKey: IAnswerKey, assigned: IWhoWhen): Promise<any> => {
    try {
      const assignedAnwser: IAssignedAnswer = {
        questionKey,
        answerKey,
        answerTitle: '',
        answerLink: '',
        created: {
          time: new Date(),
          nickName: assigned.nickName
        },
        modified: null
      }
      let question: IQuestion | null = null;
      const dto = new AssignedAnswerDto(assignedAnwser).assignedAnswerDto;
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
    state, openCategoryNode, loadTopCategoryRows: loadFirstLevelCategoryRows,
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

