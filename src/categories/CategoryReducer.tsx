import { Reducer } from 'react'
import { ActionTypes, ICategoriesState, ICategory, IQuestion, CategoriesActions, ILocStorage, ICategoryKey, ICategoryKeyExtended, IQuestionRow, Question, IQuestionRowDto, IQuestionKey, CategoryKey, QuestionKey, ICategoryDto, QuestionRow, ICategoryRow, CategoryRow, actionStoringToLocalStorage, ICategoryRowDto, FormMode, IsCategory } from "categories/types";

export const initialQuestion: IQuestion = {
 	topId: '',
	parentId: null,
  id: 'will be given by DB',
  categoryTitle: '',
  title: '',
  assignedAnswers: [],
  numOfAssignedAnswers: 0,
  relatedFilters: [],
  numOfRelatedFilters: 0,
  source: 0,
  status: 0,
  isSelected: false
}

export const initialCategory: ICategory = {
  topId: 'null',
  parentId: 'null',
  id: '',
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

export const initialState: ICategoriesState = {
  formMode: FormMode.None,

  topRows: [],
  topRowsLoading: false,
  topRowsLoaded: false,

  nodeOpening: false,
  nodeOpened: false,

  keyExpanded: {
    topId: "MTS",
    parentId: null,
    id: "REMOTECTRLS",
    questionId: "qqqqqq111"
  },
  

  categoryId_questionId_done: undefined,

  activeCategory: null,
  activeQuestion: null,

  loadingCategories: false,
  loadingQuestions: false,
  loadingCategory: false,
  loadingQuestion: false
}


// let state_fromLocalStorage: IState_fromLocalStorage | undefined;
// const hasMissingProps = (): boolean => {
//   let b = false;
//   const keys = Object.keys(initialStateFromLocalStorage!)
//   Object.keys(initialState).forEach((prop: string) => {
//     if (!keys.includes(prop)) {
//       b = true;
//       console.log('missing prop:', prop, ' try with SignOut')
//     }
//   })
//   return b;
// }

let initialCategoriesState: ICategoriesState = {
  ...initialState
}

if ('localStorage' in window) {
  console.log('Arghhhhhhhhhhhhhhhhhhhhhhhhhhhhhhhhh CATEGORIES_STATE loaded before signIn')
  const s = localStorage.getItem('CATEGORIES_STATE');
  if (s !== null) {
    const locStorage = JSON.parse(s);
    const { keyExpanded } = locStorage!;
    const nodeOpened = keyExpanded ? false : true;
    initialCategoriesState = {
      ...initialCategoriesState,
      keyExpanded: { ...keyExpanded },
      nodeOpened
    }
    console.log('initialCategoriesState nakon citanja iz memorije', initialCategoriesState);
  }
}

export { initialCategoriesState };

export const CategoryReducer: Reducer<ICategoriesState, CategoriesActions> = (state, action) => {

  console.log('------------------------------->', action.type)
  // -----------------------------------------------------------------------
  // Rubljov, by giving the right name, you reveal the essence of things
  // -----------------------------------------------------------------------
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
  const innerReducerModifiedTree = [
    ActionTypes.SET_TOP_ROWS,
    ActionTypes.NODE_OPENING,
    ActionTypes.SET_NODE_OPENED
  ]

  const { categoryRow } = action.payload;
  const isCategory = IsCategory(categoryRow); // ICategory rather than ICategoryRow
  // const modifyTree = categoryRow && !isCategory;
  // let us modify tree and rest of state in single action
  const modifyTree = categoryRow !== undefined && !innerReducerModifiedTree.includes(action.type);

  const { topRows: topCategoryRows } = state;

  let newTopCategoryRows: ICategoryRow[];

  const newState = innerReducer(state, action);
  // return {
  //   ...state, // sjebace topCategoryRows
  //   ...
  // }

  // Action that modify Tree
  // Actually part topCategoryRows of state
  if (modifyTree) {
    const { topId, id } = categoryRow!;
    if (id === topId) {
      // actually topCategoryRows is from previous state
      newTopCategoryRows = topCategoryRows.map(c => c.id === topId
        ? new DeepClone(categoryRow!).categoryRow
        : new DeepClone(c).categoryRow
      );
    }
    else {
      // actually topCategoryRows is from previous state
      const topRow: ICategoryRow = topCategoryRows.find(c => c.id === topId)!;
      DeepClone.idToSet = id;
      DeepClone.newCategoryRow = categoryRow!;
      const newTopRow = new DeepClone(topRow).categoryRow;
      newTopCategoryRows = topCategoryRows.map(c => c.id === topId
        ? newTopRow
        : new DeepClone(c).categoryRow
      );
    }
    newState.topRows = newTopCategoryRows;
  }
  else {
    // just clone to enable time-travel debugging
    //DeepClone.idToSet = '';
    //const state3 = { ...state } // shallow clone
    //const newState = reducer(state3, action); // do not modify topCategoryRows inside reducer actions
    // newState.topCategoryRows
    //newTopCategoryRows = state.topCategoryRows;
    //newTopCategoryRows = topCategoryRows.map(c => new DeepClone(c).categoryRow)
  }


  if (actionStoringToLocalStorage.includes(action.type)) {
    const { keyExpanded } = newState;
    const locStorage: ILocStorage = {
      lastKeyExpanded: keyExpanded,
      lastQuestionId: null
    }
    localStorage.setItem('CATEGORIES_STATE', JSON.stringify(locStorage));
  }
  return newState;
}

const innerReducer = (state: ICategoriesState, action: CategoriesActions): ICategoriesState => {
  switch (action.type) {

    //////////////////////////////////////////////////
    // CategoryRows Level: 1

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
      const { categoryRow, keyExpanded, fromChatBotDlg } = action.payload;
      const { id, questionId } = keyExpanded; //;
      const { topRows } = state;
      return {
        ...state,
        topRows: topRows.map(c => c.id === categoryRow.id
          ? { ...categoryRow }
          : { ...c }
        ),
        keyExpanded,
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


    case ActionTypes.FORCE_OPEN_NODE:
      const { keyExpanded } = action.payload;
      return {
        ...state,
        nodeOpening: false,
        nodeOpened: false,
        topRows: [],
        topRowsLoaded: false,
        keyExpanded
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
      const { topRows: topCategoryRows } = state;
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
        parentId: id
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


    case ActionTypes.SET_CATEGORY: {
      const { categoryRow } = action.payload; // category doesn't contain  inAdding 
      console.assert(IsCategory(categoryRow));
      const categoryKey = new CategoryKey(categoryRow).categoryKey!;
      return {
        ...state,
        // keep mode
        loadingCategory: false,
        //keyExpanded: { ...categoryKey },
        activeCategory: categoryRow,
        activeQuestion: null
      }
    }

    case ActionTypes.SET_ROW_EXPANDING: {
      return {
        ...state,
        loadingCategories: true
      }
    }

    case ActionTypes.SET_ROW_EXPANDED: {
      const { categoryRow, formMode } = action.payload;
      const { topId: rowTopId, parentId: rowParentId, id: rowId } = categoryRow;
      let { keyExpanded } = state;
      if (keyExpanded) {
        const { topId, id } = keyExpanded;
        keyExpanded = {
          topId: rowTopId,
          parentId: rowParentId,
          id: rowId,
          questionId: null
        }
      }
      // Do not work with categoryRow, 
      // categoryRow will be proccesed in CategoryReducer, rather than in innerReducer
      return {
        ...state,
        // keep mode
        loadingCategories: false,
        keyExpanded,
        activeCategory: null,
        activeQuestion: null,
        formMode
      }
    }

    case ActionTypes.SET_ROW_COLLAPSING: {
      return {
        ...state,
        // keep mode
        loadingCategories: true
      }
    }

    case ActionTypes.SET_ROW_COLLAPSED: {
      const { categoryRow } = action.payload; // category doesn't contain  inAdding 
      const { topId, id } = categoryRow;
      const categoryKey = new CategoryKey(categoryRow).categoryKey
      return {
        ...state,
        // keep mode
        loadingCategories: false,
        keyExpanded: { ...categoryKey, questionId: null },
        activeCategory: null,
        activeQuestion: null
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
        activeQuestion: null
      };
    }

    case ActionTypes.SET_CATEGORY_ADDED:
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
        activeQuestion: null
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

    case ActionTypes.CATEGORY_TITLE_CHANGED: {
      const { value, id } = action.payload;
      const { topRows: topCategoryRows } = state;
      const categoryRow: ICategoryRow | undefined = findCategory(topCategoryRows, id);
      if (categoryRow) {
        categoryRow.title = value;
      }
      return {
        ...state,
      };
    }

    case ActionTypes.QUESTION_TITLE_CHANGED: {
      const { categoryId, id, value } = action.payload;
      const { topRows: topCategoryRows } = state;
      const categoryRow: ICategoryRow | undefined = findCategory(topCategoryRows, categoryId);
      if (categoryRow) {
        categoryRow.questionRows.find(q => q.id === id)!.title = value;
      }
      return {
        ...state,
      };
    }

    case ActionTypes.CANCEL_ADD_SUB_CATEGORY: {
      return {
        ...state,
        activeCategory: null,
        activeQuestion: null,
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
        activeQuestion: null
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
      // const rootCategoryRows = newTopCategoryRows.map((c: ICategory) => c.id === parentId
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
        //categoryKeyExpanded: { topId: parentId, id: parentId, questionId: id },
        activeQuestion: question,
        formMode: FormMode.EditingQuestion,
        loadingQuestion: false
      }
    }

    case ActionTypes.DELETE_QUESTION: {
      const { question } = action.payload;
      const { parentId, id } = question;
      return {
        ...state, // Popravi
        // categoryKeyExpanded: newRootCategoryRows.map((c: ICategory) => c.id === parentId
        //   ? {
        //     ...c,
        //     questionRows: c.questionRows.filter(q => q.id !== id)
        //   }
        //   : c
        // ),
        activeQuestion: null,
        formMode: FormMode.None
      }
    }

    case ActionTypes.CANCEL_QUESTION_FORM:
    case ActionTypes.CLOSE_QUESTION_FORM: {
      const { question } = action.payload;
      return {
        ...state,
        formMode: FormMode.None,
        activeQuestion: null
      };
    }

    default:
      return state;  // TODO throw error
  }
};


function findCategory(categoryRows: ICategoryRow[], id: string): ICategoryRow | undefined {
  let cat: ICategoryRow | undefined = categoryRows.find(c => c.id === (id ?? 'null'));
  if (!cat) {
    try {
      categoryRows.forEach(c => {
        cat = findCategory(c.categoryRows, id);
        if (cat) {
          throw new Error("Stop the loop");
        }
      })
    }
    catch (e) {
      console.log("Loop stopped");
    }
  }
  return cat;
}

export class DeepClone {
  static idToSet: string;
  static newCategoryRow: ICategoryRow;
  constructor(categoryRow: ICategoryRow) {
    const { topId, id, parentId, title, link, kind, header, level, variations, numOfQuestions,
      hasSubCategories, categoryRows: subCategories, created, modified, questionRows, isExpanded } = categoryRow;

    const subCats = subCategories.map((cat: ICategoryRow) => {
      if (cat.id === DeepClone.idToSet) {
        return { ...DeepClone.newCategoryRow }
      }
      else {
        return new DeepClone(cat).categoryRow
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
      categoryRows: subCats,
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


