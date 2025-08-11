import { Reducer } from 'react'
import {
  ActionTypes, Actions, ILocStorage, IsCategory,
  ICategoriesState, ICategory, CategoryKey, ICategoryRow, IQuestion,
  actionStoringToLocalStorage, FormMode, doNotCloneActions, doNotCallInnerReducerActions
} from "categories/types";

export const initialQuestion: IQuestion = {
  topId: '',
  parentId: 'null',
  id: 'generateId', //  keep 'generateId', it is expected at BackEnd
  categoryTitle: '',
  title: '',
  assignedAnswers: [],
  numOfAssignedAnswers: 0,
  relatedFilters: [],
  numOfRelatedFilters: 0,
  source: 0,
  status: 0,
  included: false
}

export const initialCategory: ICategory = {
  topId: 'null',
  parentId: 'null',
  id: 'define at BackEnd',
  kind: 0,
  title: '',
  link: '',
  header: '',
  level: 0,
  variations: [],
  hasSubCategories: false,
  categoryRows: [],
  questionRows: [],
  numOfQuestions: 0,
  hasMoreQuestions: false,
  isExpanded: false,
  doc1: ''
}

export const CategoryReducer: Reducer<ICategoriesState, Actions> = (state, action) => {

  console.log('------------------------------->', action.type)
  // ----------------------------------------------------------------------
  // Rubljov: "By giving the right name, you reveal the essence of things"
  // ----------------------------------------------------------------------
  //
  // - firstLevelCategoryRow AAA
  // ------> categoryRow AAA.1
  // --------- > categoryRow AAA 1.1
  // --------- > ...
  //
  // ------> categoryRow AAA.2
  // --------- > categoryRow AAA 2.1
  // --------- > categoryRow AAA 2.2
  // ------------ > Category Row AAA 2.2.1
  // ------------ > categoryRow AAA 2.2.2
  // --------------- > categoryRow AAA 2.2.2.1
  // --------------- > categoryRow AAA 2.2.2.2
  //
  // --------- > categoryRow AAA 2.3
  //
  // - firstLevelCategoryRow BBB
  // - ...

  const { categoryRow } = action.payload;
  // const isCategory = IsCategory(categoryRow); // ICategory rather than ICategoryRow

  if (action.type === ActionTypes.SET_FROM_LOCAL_STORAGE) {
    const { keyExpanded } = action.payload;
    return {
      ...state,
      keyExpanded
    }
  }

  const modifyTree = categoryRow
    ? doNotCloneActions.includes(action.type) ? false : true
    : false;

  const { topRows } = state;

  const newState = doNotCallInnerReducerActions.includes(action.type)
    ? { ...state }
    : innerReducer(state, action);

  // return { ...state } // calling this, state would be destroyed, because of shallow copy

  // Action that modify Tree
  // Actually part topRows of state
  if (modifyTree) {
    let newTopRows: ICategoryRow[];
    const { topId, id } = categoryRow!;
    if (id === topId) {
      // actually topRows is from previous state
      newTopRows = topRows.map(c => c.id === topId
        ? new DeepClone(categoryRow!).categoryRow
        : new DeepClone(c).categoryRow
      );
    }
    else {
      // actually topRows is from previous state
      const topRow: ICategoryRow = topRows.find(c => c.id === topId)!;
      DeepClone.idToSet = id;
      DeepClone.newCategoryRow = categoryRow!;
      const newTopRow = new DeepClone(topRow).categoryRow;
      newTopRows = topRows.map(c => c.id === topId
        ? newTopRow
        : new DeepClone(c).categoryRow
      );
      DeepClone.idToSet = '';
    }
    newState.topRows = newTopRows;
  }
  else {
    // just clone to enable time-travel debugging
  }

  if (actionStoringToLocalStorage.includes(action.type)) {
    const { keyExpanded } = newState;
    const locStorage: ILocStorage = {
      keyExpanded
    }
    localStorage.setItem('CATEGORIES_STATE', JSON.stringify(locStorage));
  }
  return newState;
}

const innerReducer = (state: ICategoriesState, action: Actions): ICategoriesState => {
  switch (action.type) {

    //////////////////////////////////////////////////
    // Rows Level: 1

    case ActionTypes.SET_TOP_ROWS_LOADING:
      return {
        ...state,
        loadingCategories: true,
        topRowsLoading: true,
        topRowsLoaded: false,
      }

    case ActionTypes.SET_TOP_ROWS: {
      const { topRows } = action.payload;
      console.log('=> CategoriesReducer ActionTypes.SET_FIRST_LEVEL_CATEGORY_ROWS', { topRows })
      return {
        ...state,
        topRows,
        topRowsLoading: false,
        topRowsLoaded: true,
        loadingCategories: false
      };
    }


    case ActionTypes.NODE_OPENING: {
      const { fromChatBotDlg } = action.payload;
      const { keyExpanded, activeCategory, activeQuestion } = state;
      return {
        ...state,
        nodeOpening: true,
        loadingCategories: true,
        nodeOpened: false,
        keyExpanded: fromChatBotDlg ? null : { ...keyExpanded! },
        activeCategory: fromChatBotDlg ? null : activeCategory,
        activeQuestion: fromChatBotDlg ? null : activeQuestion
      }
    }

    case ActionTypes.SET_NODE_OPENED: {
      const { categoryRow, catKey, questionId, fromChatBotDlg } = action.payload;
      const { topId, id } = catKey; //;
      const { topRows } = state;
      return {
        ...state,
        topRows: topRows.map(c => c.id === categoryRow.id
          ? { ...categoryRow }
          : { ...c }
        ),
        //keyExpanded, // TODO proveri
        categoryId_questionId_done: `${id}_${questionId}`,
        nodeOpening: false,
        nodeOpened: true,
        loadingCategories: false
        //mode: Mode.NULL // reset previosly selected form
      };
    }

    case ActionTypes.SET_LOADING_CATEGORY:
      return {
        ...state,
        loadingCategory: true
      }


    // case ActionTypes.FORCE_OPEN_NODE:
    //   const { keyExpanded } = action.payload;
    //   return {
    //     ...state,
    //     nodeOpening: false,
    //     nodeOpened: false,
    //     topRows: [],
    //     topRowsLoaded: false,
    //     keyExpanded
    //   }

    case ActionTypes.FORCE_OPEN_NODE:
      const { keyExpanded } = action.payload;
      return {
        ...state,
        topRows: state.topRows.filter(row => row.parentId === null),
        keyExpanded,
        nodeOpened: false, // keep topRows, and openNode
        activeCategory: null,
        activeQuestion: null,
        selectedQuestionId: null
      }

    // case ActionTypes.RESET_CATEGORY_QUESTION_DONE: {
    //   return {
    //     ...state,
    //     categoryId_questionId_done: undefined,
    //     categoryNodeLoaded: false
    //   };
    // }

    case ActionTypes.SET_SUB_CATEGORIES: {
      const { id, categoryRows } = action.payload;
      const { topRows } = state;
      categoryRows.forEach((categoryRow: ICategoryRow) => {
        const { id, hasSubCategories, numOfQuestions } = categoryRow;
      })
      return {
        ...state,
        loadingCategory: false
      };
    }


    case ActionTypes.SET_ERROR: {
      const { error, whichRowId } = action.payload; // category.id or question.id
      return {
        ...state,
        error,
        whichRowId,
        loadingCategories: false,
        loadingQuestions: false,
        loadingCategory: false,
        loadingQuestion: false
      };
    }

    case ActionTypes.ADD_SUB_CATEGORY: {
      const { categoryKey, level } = action.payload;
      const { topId, id } = categoryKey;
      const category: ICategory = {
        ...initialCategory,
        topId: topId,
        level,
        parentId: null
      }
      return {
        ...state,
        activeCategory: category,
        formMode: FormMode.AddingCategory
      };
    }

    /*
    case ActionTypes.SET_CATEGORY_ADDED: {
      const { categoryRow } = action.payload;
      return {
        ...state,
        // TODO Popravi
        formMode: FormMode.None,
        activeCategory: categoryRow!,
        loading: false
      }
    }
      */


    // case ActionTypes.SET_CATEGORY_ROW: {
    //   const { categoryRow } = action.payload; // category doesn't contain  inAdding 
    //   console.assert(IsCategory(categoryRow));
    //   const categoryKey = new CategoryKey(categoryRow).categoryKey!;
    //   return {
    //     ...state,
    //     // keep mode
    //     loadingCategory: false,
    //     //keyExpanded: { ...categoryKey },
    //     activeCategory: categoryRow,
    //     activeQuestion: null
    //   }
    // }

    case ActionTypes.SET_CATEGORY: {
      const { categoryRow } = action.payload; // category doesn't contain  inAdding 
      console.assert(IsCategory(categoryRow));
      const categoryKey = new CategoryKey(categoryRow).categoryKey!;
      return {
        ...state,
        // keep mode
        loadingCategory: false,
        //keyExpanded: { ...categoryKey },
        activeCategory: null, //categoryRow,
        activeQuestion: null,
        selectedQuestionId: null
      }
    }

    case ActionTypes.SET_ROW_EXPANDING: {
      return {
        ...state,
        rowExpanding: true,
        rowExpanded: false,
        loadingCategories: true
      }
    }

    case ActionTypes.SET_ROW_EXPANDED: {
      const { categoryRow, formMode, selectedQuestionId } = action.payload;
      const { topId, id } = categoryRow;
      // Do not work with categoryRow, 
      // categoryRow will be proccesed in CategoryReducer, rather than in innerReducer
      return {
        ...state,
        // keep mode
        loadingCategories: false,
        keyExpanded: {
          topId,
          categoryId: id,
          questionId: null
        },
        activeCategory: null,
        activeQuestion: null,
        /*selectedQuestionId: selectedQuestionId ?? null, */
        loadingQuestion: false,
        rowExpanding: false,
        rowExpanded: true,
        formMode
      }
    }

    case ActionTypes.SET_ROW_COLLAPSING: {
      return {
        ...state,
        // keep mode
        loadingCategories: true, 
        rowExpanding: true, // actually collapsing
        rowExpanded: false
      }
    }

    case ActionTypes.SET_ROW_COLLAPSED: {
      const { categoryRow } = action.payload; // category doesn't contain  inAdding 
      const { topId, id } = categoryRow;
      //const categoryKey = new CategoryKey(categoryRow).categoryKey
      return {
        ...state,
        // keep mode
        loadingCategories: false,
        keyExpanded: { topId, categoryId: id, questionId: null },
        rowExpanding: false, // actually collapsing
        rowExpanded: true,
        activeCategory: null,
        activeQuestion: null,
        selectedQuestionId: null
      }
    }


    case ActionTypes.SET_CATEGORY_TO_VIEW: {
      const { categoryRow } = action.payload;
      console.assert(IsCategory(categoryRow))
      const category: ICategory = categoryRow as ICategory;
      const activeCategory: ICategory = { ...category, isExpanded: false }
      const { topId, id, parentId } = category;
      return {
        ...state,
        formMode: FormMode.ViewingCategory,
        loadingCategory: false,
        //keyExpanded: { ...state.keyExpanded, questionId: null },
        activeCategory,
        activeQuestion: null,
        selectedQuestionId: null
      };
    }

    case ActionTypes.SET_CATEGORY_ADDED: {
      const { categoryRow } = action.payload; // ICategory extends ICategoryRow
      console.assert(IsCategory(categoryRow))
      // TODO what about instanceof?
      const category: ICategory = categoryRow as ICategory;
      const activeCategory: ICategory = { ...category, isExpanded: false }
      const { topId, id, parentId } = category;
      const topRowsLoaded = parentId ? true : false;
      return {
        ...state,
        formMode: FormMode.EditingCategory,
        loadingCategory: false,
        topRowsLoaded,
        //categoryKeyExpanded: state.categoryKeyExpanded ? { ...state.categoryKeyExpanded, questionId: null } : null,
        activeCategory,
        activeQuestion: null,
        selectedQuestionId: null
      };
    }

    case ActionTypes.SET_CATEGORY_TO_EDIT:   // doesn't modify Tree
    case ActionTypes.SET_CATEGORY_UPDATED: { // modifies Tree
      const { categoryRow } = action.payload; // ICategory extends ICategoryRow
      console.assert(IsCategory(categoryRow))
      // TODO what about instanceof?
      const category: ICategory = categoryRow as ICategory;
      const activeCategory: ICategory = { ...category, isExpanded: false }
      const { topId, id, parentId } = category;
      return {
        ...state,
        formMode: FormMode.EditingCategory,
        loadingCategory: false,
        //categoryKeyExpanded: state.categoryKeyExpanded ? { ...state.categoryKeyExpanded, questionId: null } : null,
        activeCategory,
        activeQuestion: null,
        selectedQuestionId: null
      };
    }

    case ActionTypes.SET_CATEGORY_QUESTIONS_LOADING:
      const { loadingQuestion } = action.payload; // category doesn't contain inAdding 
      return {
        ...state,
        loadingQuestions: true
      }

    case ActionTypes.CATEGORY_QUESTIONS_LOADED: {
      const { categoryRow } = action.payload;
      const { id, topId: topId, questionRows, hasMoreQuestions } = categoryRow;
      return {
        ...state,
        loadingQuestions: false
      }
    }

    case ActionTypes.DELETE_CATEGORY: {
      const { id } = action.payload;
      // TODO Popravi
      return {
        ...state,
        activeCategory: null,
        formMode: FormMode.None,
        error: undefined,
        whichRowId: undefined
      };
    }

    case ActionTypes.CANCEL_CATEGORY_FORM:
    case ActionTypes.CLOSE_CATEGORY_FORM: {
      return {
        ...state,
        formMode: FormMode.None
      };
    }


    // First we add a new question to the category.guestions
    // After user clicks Save, we call createQuestion 
    /*
    case ActionTypes.ADD_QUESTION: {
      const { categoryInfo } = action.payload;
      const { categoryKey, level } = categoryInfo;
      const { topId, id } = categoryKey;
      const question: IQuestion = {
        ...initialQuestion,
        topId: id ?? '',
        parentId: id,
        inAdding: true
      }
      return {
        ...state,
        mode: Mode.AddingQuestion,
        activeQuestion: question
      };
    }
    */


    case ActionTypes.CANCEL_ADD_SUB_CATEGORY: {
      return {
        ...state,
        activeCategory: null,
        activeQuestion: null,
        selectedQuestionId: null,
        formMode: FormMode.None
      };
    }


    case ActionTypes.SET_LOADING_QUESTION:
      return {
        ...state,
        loadingQuestion: true
      }

    case ActionTypes.CANCEL_ADD_QUESTION: {
      return {
        ...state,
        formMode: FormMode.None,
        activeQuestion: null,
        selectedQuestionId: null
      };
    }

    case ActionTypes.SET_QUESTION_SELECTED: { // from Categories / AutoSuggestQuestion
      const { questionKey } = action.payload;
      const { topId, parentId: categoryId, id: questionId } = questionKey;
      return {
        ...state,
        topRows: state.topRows.filter(row => row.parentId === null),
        keyExpanded: {
          topId,
          categoryId: categoryId,
          questionId
        },
        nodeOpened: false, // keep topRows, and openNode
        activeCategory: null,
        activeQuestion: null,
        selectedQuestionId: null
      };
    }


    case ActionTypes.ADD_NEW_QUESTION_TO_ROW: {
      const { categoryRow, newQuestionRow } = action.payload;
      return {
        ...state,
        selectedQuestionId: newQuestionRow.id
      };
    }


    case ActionTypes.SET_QUESTION: {
      const { question, formMode } = action.payload;
      console.log(ActionTypes.SET_QUESTION, question)
      return {
        ...state,
        activeCategory: null,
        activeQuestion: question,
        formMode,
        error: undefined,
        loadingQuestion: false
      };
    }

    case ActionTypes.SET_QUESTION_AFTER_ASSIGN_ANSWER: {
      const { question } = action.payload;
      const { parentId, id } = question;
      const inAdding = state.formMode === FormMode.AddingQuestion;

      // for inAdding, _id is IDBValidKey('000000000000000000000000')
      // thats why we look for q.inAdding instead of q._id === _id
      // const x = state.categories.filter(c => c.id === parentId).filter(q=>q.id === id);
      // console.error('SET_QUESTION_AFTER_ASSIGN_ANSWER', {x})

      // TODO Popravi
      // const rootRows = newTopRows.map((c: ICategory) => c.id === parentId
      //   ? {
      //     ...c,
      //     questionRows: inAdding
      //       ? c.questionRows.map(q => q.inAdding ? { ...question, inAdding: q.inAdding } : q)
      //       : c.questionRows.map(q => q.id === id ? { ...question } : q), // TODO sta, ako je inViewing
      //     inAdding: c.inAdding
      //   }
      //   : c
      // );
      return {
        ...state,
        //formMode: state.formMode, // keep mode
        activeQuestion: question,
        loadingQuestion: false
      };
    }


    case ActionTypes.SET_QUESTION_TO_VIEW: {
      const { question } = action.payload;
      const { topId, id, parentId } = question;
      const { keyExpanded } = state;
      return {
        ...state,
        formMode: FormMode.ViewingQuestion,
        keyExpanded,
        activeQuestion: question,
        loadingQuestion: false
      }
    }

    case ActionTypes.SET_QUESTION_TO_EDIT: {
      const { question } = action.payload;
      const { topId, id, parentId } = question;
      const { keyExpanded } = state;
      return {
        ...state,
        // categoryKeyExpanded: categoryKeyExpanded
        //   ? { ...categoryKeyExpanded, questionId: categoryKeyExpanded.id === parentId ? id : null }
        //   : null,
        keyExpanded: { topId, categoryId: parentId, questionId: id },
        activeQuestion: question,
        formMode: FormMode.EditingQuestion,
        loadingQuestion: false
      }
    }

    case ActionTypes.QUESTION_DELETED: {
      const { question } = action.payload;
      const { parentId, id } = question;
      return {
        ...state, // Popravi
        activeQuestion: null,
        selectedQuestionId: null,
        formMode: FormMode.None,
        loadingQuestion: false
      }
    }

    case ActionTypes.CANCEL_QUESTION_FORM:
    case ActionTypes.CLOSE_QUESTION_FORM: {
      const { question } = action.payload;
      return {
        ...state,
        formMode: FormMode.None,
        activeQuestion: null,
        selectedQuestionId: null
      };
    }

    default:
      alert(`Action ${action.type} not allowed`)
      return {
        ...state
      }
  }
};


/* -----------------------------
   Deep Clone
----------------------------- */
export class DeepClone {
  static idToSet: string;
  static newCategoryRow: ICategoryRow;
  constructor(categoryRow: ICategoryRow) {
    const { topId, id, parentId, title, link, kind, header, level, variations, numOfQuestions,
      hasSubCategories, categoryRows, created, modified, questionRows, isExpanded } = categoryRow;

    const subCatRows = categoryRows.map((catRow: ICategoryRow) => {
      console.log('DeepClone >>>>>>>>>>>>>>>', catRow.id)
      if (catRow.id === DeepClone.idToSet) {
        return { ...DeepClone.newCategoryRow }
      }
      else {
        return new DeepClone(catRow).categoryRow
      }
    });

    this.categoryRow = {
      topId,
      parentId,
      id,
      kind,
      title,
      link,
      header,
      level,
      hasSubCategories,
      categoryRows: subCatRows,
      numOfQuestions,
      questionRows,
      variations: variations ?? [],
      created,
      modified,
      isExpanded
    }
  }
  categoryRow: ICategoryRow;
}


