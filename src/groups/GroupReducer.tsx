import { Reducer } from 'react'
import { ActionTypes, IGroupsState, IGroup, IAnswer, GroupsActions, ILocStorage, IGroupKey, IGroupKeyExtended, IAnswerRow, Answer, IAnswerRowDto, IAnswerKey, GroupKey, AnswerKey, IGroupDto, AnswerRow, IGroupRow, GroupRow, actionTypesStoringToLocalStorage, IGroupRowDto, FormMode, IsGroup } from "groups/types";

export const initialAnswer: IAnswer = {
  partitionKey: '',
  id: 'will be given by DB',
  rootId: '',
  parentGroup: '',
  groupTitle: '',
  title: '',
  link: '',
  source: 0,
  status: 0,
  isSelected: false
}

export const initialGroup: IGroup = {
  partitionKey: 'null',
  id: '',
  kind: 0,
  title: '',
  link: '',
  header: '',
  level: 0,
  variations: [],
  rootId: '',
  parentGroup: 'null',
  hasSubGroups: false,
  groupRows: [],
  answerRows: [],
  numOfAnswers: 0,
  hasMoreAnswers: false,
  isExpanded: false,
  doc1: ''
}

export const initialState: IGroupsState = {
  formMode: FormMode.None,

  topRows: [],
  topRowsLoading: false,
  topRowsLoaded: false,

  nodeOpening: false,
  nodeOpened: false,

  keyExpanded: {
    partitionKey: "REMOTECTRLS",
    id: "REMOTECTRLS",
    answerId: null //"aaaaaa111"
  },
  groupId_answerId_done: undefined,

  activeGroup: null,
  activeAnswer: null,

  loading: false,
  answerLoading: false
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

let initialGroupsState: IGroupsState = {
  ...initialState
}

if ('localStorage' in window) {
  console.log('Arghhhhhhhhhhhhhhhhhhhhhhhhhhhhhhhhh GROUPS_STATE loaded before signIn')
  const s = localStorage.getItem('GROUPS_STATE');
  if (s !== null) {
    const locStorage = JSON.parse(s);
    const { lastGroupKeyExpanded } = locStorage!;
    const groupNodeOpened = lastGroupKeyExpanded ? false : true;
    initialGroupsState = {
      ...initialGroupsState,
      keyExpanded: { ...lastGroupKeyExpanded },
      nodeOpened: groupNodeOpened
    }
    console.log('initialGroupsState nakon citanja iz memorije', initialGroupsState);
  }
}

export { initialGroupsState };

export const GroupReducer: Reducer<IGroupsState, GroupsActions> = (state, action) => {

  console.log('------------------------------->', action.type)
  // -----------------------------------------------------------------------
  // Rubljov, by giving the right name, you reveal the essence of things
  // -----------------------------------------------------------------------
  //
  // - firstLevelGroupRow AAA
  // ------> groupRow AAA.1
  // --------- > groupRow AAA 1.1
  // --------- > ...
  //
  // ------> groupRow AAA.2
  // --------- > groupRow AAA 2.1
  // --------- > groupRow AAA 2.2
  // ------------ > Group Row AAA 2.2.1
  // ------------ > groupRow AAA 2.2.2
  // --------------- > groupRow AAA 2.2.2.1
  // --------------- > groupRow AAA 2.2.2.2
  //
  // --------- > groupRow AAA 2.3
  //
  // - firstLevelGroupRow BBB
  // - ...
  const innerReducerModifiedTree = [
    ActionTypes.SET_TOP_ROWS,
    ActionTypes.GROUP_NODE_OPENING,
    ActionTypes.SET_NODE_OPENED
  ]

  const { groupRow } = action.payload;
  const isGroup = IsGroup(groupRow); // IGroup rather than IGroupRow
  // const modifyTree = groupRow && !isGroup;
  // let us modify tree and rest of state in single action
  const modifyTree = groupRow !== undefined && !innerReducerModifiedTree.includes(action.type);
  const { topRows } = state;
  let newTopGroupRows: IGroupRow[];

  const newState = innerReducer(state, action);
  // return {
  //   ...state, // shallow copy, sjebace topRows
  //   ...
  // }

  // Actions that modify TreeView
  // Actually part topRows of state
  if (modifyTree) {
    const { rootId, id } = groupRow!;
    if (id === rootId) {
      // actually topRows is from previous state
      newTopGroupRows = topRows.map(c => c.id === rootId
        ? new DeepClone(groupRow!).groupRow
        : new DeepClone(c).groupRow
      );
    }
    else {
      // actually topRows is from previous state
      const topRow: IGroupRow = topRows.find(c => c.id === rootId)!;
      DeepClone.idToSet = id;
      DeepClone.newGroupRow = groupRow!;
      const newTopRow = new DeepClone(topRow).groupRow;
      newTopGroupRows = topRows.map(c => c.id === rootId
        ? newTopRow
        : new DeepClone(c).groupRow
      );
    }
    newState.topRows = newTopGroupRows;
  }
  else {
    // just clone to enable time-travel debugging
    //DeepClone.idToSet = '';
    //const state3 = { ...state } // shallow clone
    //const newState = reducer(state3, action); // do not modify topGroupRows inside reducer actions
    // newState.topGroupRows
    //newTopGroupRows = state.topGroupRows;
    //newTopGroupRows = topGroupRows.map(c => new DeepClone(c).groupRow)
  }

  /*
  const state2 = {
    ...state,
    //topGroupRows: [] //newTopGroupRows
  }
  */

  // const newState = reducer(state, action);

  // if (modifyTree) {
  //   newState.topGroupRows = newTopGroupRows;
  // }

  if (actionTypesStoringToLocalStorage.includes(action.type)) {
    const { keyExpanded: groupKeyExpanded } = newState;
    const locStorage: ILocStorage = {
      lastGroupKeyExpanded: groupKeyExpanded
    }
    localStorage.setItem('GROUPS_STATE', JSON.stringify(locStorage));
  }
  return newState;
}

const innerReducer = (state: IGroupsState, action: GroupsActions): IGroupsState => {
  switch (action.type) {

    case ActionTypes.SET_TOP_ROWS_LOADING:
      return {
        ...state,
        topRowsLoading: true,
        topRowsLoaded: false
      }

    case ActionTypes.SET_LOADING:
      return {
        ...state,
        loading: true
      }

    //////////////////////////////////////////////////
    // GroupRows Level: 1
    case ActionTypes.SET_TOP_ROWS: {
      const { topGroupRows } = action.payload;
      console.log('=> GroupsReducer ActionTypes.SET_FIRST_LEVEL_GROUP_ROWS', { topGroupRows })
      return {
        ...state,
        topRows: topGroupRows,
        topRowsLoading: false,
        topRowsLoaded: true,
        loading: false
      };
    }


    case ActionTypes.GROUP_NODE_OPENING: {
      //const { groupKeyExpanded } = action.payload;
      return {
        ...state,
        nodeOpening: true,
        nodeOpened: false
        //topGroupRows: [],
        //groupKeyExpanded
      }
    }

    case ActionTypes.SET_NODE_OPENED: {
      const { groupRow, keyExpanded, fromChatBotDlg } = action.payload;
      const { id, answerId } = keyExpanded; //;
      const { topRows: topGroupRows } = state;
      const topGrpRows: IGroupRow[] = topGroupRows.map(c => c.id === groupRow.id
        ? { ...groupRow }
        : { ...c }
      )
      return {
        ...state,
        topRows: topGrpRows,
        keyExpanded,
        groupId_answerId_done: `${id}_${answerId}`,
        nodeOpening: false,
        nodeOpened: true,
        loading: false
        //mode: Mode.NULL // reset previosly selected form
      };
    }


    case ActionTypes.SET_NODE_OPENED: {
      const { groupRow, answerId, fromChatBotDlg } = action.payload; // groupKeyExpanded, 
      const { id } = groupRow; //groupKeyExpanded;
      console.log('====== >>>>>>> GroupsReducer ActionTypes.SET_GROUP_NODE_OPENED payload ', action.payload)
      const topGroupRows: IGroupRow[] = fromChatBotDlg
        ? []
        : state.topRows.map(c => c.id === groupRow.id
          ? { ...groupRow }
          : { ...c }
        )
      return {
        ...state,
        topRows: topGroupRows,
        groupId_answerId_done: `${id}_${answerId}`,
        nodeOpening: false,
        nodeOpened: true,
        loading: false
        //mode: Mode.NULL // reset previosly selected form
      };
    }

    case ActionTypes.FORCE_OPEN_GROUP_NODE:
      const { keyExpanded } = action.payload;
      return {
        ...state,
        nodeOpening: false,
        nodeOpened: false,
        topRows: [],
        topRowsLoaded: false,
        keyExpanded
      }

    case ActionTypes.SET_GROUP_ANSWERS_LOADING:
      const { answerLoading } = action.payload; // group doesn't contain inAdding 
      return {
        ...state,
        answerLoading
      }

    // case ActionTypes.RESET_GROUP_ANSWER_DONE: {
    //   return {
    //     ...state,
    //     groupId_answerId_done: undefined,
    //     groupNodeLoaded: false
    //   };
    // }

    case ActionTypes.SET_SUB_GROUPS: {
      const { id, groupRows } = action.payload;
      groupRows.forEach((groupRow: IGroupRow) => {
        const { id, hasSubGroups, numOfAnswers } = groupRow;
      })
      return {
        ...state,
        loading: false
      };
    }


    case ActionTypes.SET_ERROR: {
      const { error, whichRowId } = action.payload; // group.id or answer.id
      return {
        ...state,
        error,
        whichRowId,
        loading: false,
        answerLoading: false
        //groupNodeLoading: false
      };
    }

    case ActionTypes.ADD_SUB_GROUP: {
      const { groupKey, level, rootId } = action.payload;
      const { partitionKey, id } = groupKey;
      const group: IGroup = {
        ...initialGroup,
        rootId,
        level,
        partitionKey: partitionKey!,
        parentGroup: id
      }
      return {
        ...state,
        activeGroup: group,
        formMode: FormMode.AddingGroup
      };
    }

    /*
    case ActionTypes.SET_GROUP_ADDED: {
      const { groupRow } = action.payload;
      return {
        ...state,
        // TODO Popravi
        formMode: FormMode.None,
        activeGroup: groupRow!,
        loading: false
      }
    }
      */


    case ActionTypes.SET_GROUP: {
      const { groupRow } = action.payload; // group doesn't contain  inAdding 
      console.assert(IsGroup(groupRow));
      const { partitionKey, id, parentGroup, rootId } = groupRow;
      const groupKey = { partitionKey, id }
      return {
        ...state,
        // keep mode
        loading: false,
        keyExpanded: { ...groupKey, answerId: null },
        formMode: FormMode.AddingGroup,
        activeGroup: groupRow,
        activeAnswer: null
      }
    }

    case ActionTypes.SET_ROW_EXPANDED: {
      const { groupRow, formMode } = action.payload;
      const { partitionKey: rowPartitionkey, id: rowId } = groupRow;
      let { keyExpanded } = state;
      if (keyExpanded) {
        const { partitionKey, id, answerId } = keyExpanded;
        keyExpanded = {
          partitionKey: rowPartitionkey,
          id: rowId,
          answerId: rowPartitionkey === partitionKey && rowId === id
            ? answerId
            : null
        }
      }
      // Do not work with groupRow, 
      // groupRow will be proccesed in GroupReducer, rather than in innerReducer
      return {
        ...state,
        // keep mode
        loading: false,
        keyExpanded,
        activeGroup: null,
        activeAnswer: null,
        formMode
      }
    }

    case ActionTypes.SET_ROW_COLLAPSED: {
      const { groupRow } = action.payload; // group doesn't contain  inAdding 
      const { partitionKey, id } = groupRow;
      const groupKey = { partitionKey, id }
      return {
        ...state,
        // keep mode
        loading: false,
        keyExpanded: null, //{ ...groupKey, answerId: null },
        activeGroup: null,
        activeAnswer: null
      }
    }


    case ActionTypes.SET_GROUP_TO_VIEW: {
      const { groupRow } = action.payload;
      console.assert(IsGroup(groupRow))
      const group: IGroup = groupRow as IGroup;
      const activeGroup: IGroup = { ...group, isExpanded: false }

      const { partitionKey, id, parentGroup, rootId } = group;
      return {
        ...state,
        formMode: FormMode.ViewingGroup,
        loading: false,
        keyExpanded: state.keyExpanded ? { ...state.keyExpanded, answerId: null } : null,
        activeGroup,
        activeAnswer: null
      };
    }

    case ActionTypes.SET_GROUP_ADDED:
    case ActionTypes.SET_GROUP_TO_EDIT:   // doesn't modify TreeView
    case ActionTypes.SET_GROUP_UPDATED: { // modifies TreeView
      const { groupRow } = action.payload; // IGroup extends IGroupRow
      console.assert(IsGroup(groupRow))
      // TODO what about instanceof?
      const group: IGroup = groupRow as IGroup;
      const activeGroup: IGroup = { ...group, isExpanded: false }
      const { partitionKey, id, parentGroup, rootId } = group;
      return {
        ...state,
        formMode: FormMode.EditingGroup,
        loading: false,
        keyExpanded: null, // otherwise group will expand
        activeGroup,
        activeAnswer: null
      };
    }

    case ActionTypes.LOAD_GROUP_ANSWERS: {
      const { groupRow } = action.payload;
      const { id, rootId, answerRows, hasMoreAnswers } = groupRow;
      //const { id, answerRows, hasMoreAnswers } = action.payload; // group doesn't contain inAdding 
      //console.log('>>>>>>>>>>>>LOAD_GROUP_ANSWERS', { id, answerRows, hasMoreAnswers })
      // let { rootGroupRows } = state;
      // const rootCat: IGroup = rootGroupRows.find(c => c.id === rootId)!;
      // DeepClone.catIdToSet = id;
      // DeepClone.newCat = groupRow;
      // const rootCatModified = new DeepClone(rootCat).groupRow;
      // const rootGroupRows2 = rootGroupRows.map(c => c.id === rootId
      //   ? rootCatModified
      //   : new DeepClone(c).groupRow
      // )
      /*
      const answers: IAnswer[] = answerRowDtos.map(answerRow => new Answer(answerRow).answer);
      */
      //if (answers.length > 0 && group!.answers.map(q => q.id).includes(answers[0].id)) {
      // privremeno  TODO  uradi isto i u group/answers
      // We have, at two places:
      //   <EditGroup inLine={true} />
      //   <EditGroup inLine={false} />
      //   so we execute loadGroupAnswers() twice in AnswerList, but OK
      // TODOOOOOOOOOOOOOOOOOOOOOOOOOOOOOOOOOOOOOOOOOOOOOOOOOOOOOOOOOOOOOOOOOOOOOOOOOO
      // return state;
      //}
      /* TODO sredi kad budes radio adding
      const answerInAdding = group!.answerRows.find(q => q.inAdding);
      if (answerInAdding) {
        //answers.unshift(answerInAdding);
        console.assert(state.mode === Mode.AddingAnswer, "expected Mode.AddingAnswer")
      }
      */
      // const arr = answerRows.map(answerRow => (answerRow.included
      //   ? {
      //     ...answerRow,
      //   }
      //   : answerRow));
      return {
        ...state,
        //groupRows: rootGroupRowsNEW,
        // state.groups.map((c: IGroup) => c.id === id
        //   ? {
        //     ...c,
        //     answerRows: c.answerRows.concat(answerRows),
        //     hasMoreAnswers,
        //     inAdding: c.inAdding,
        //     isExpanded: c.isExpanded
        //   }
        //   : c),
        // keep mode
        answerLoading: false
      }
    }

    case ActionTypes.DELETE_GROUP: {
      const { id } = action.payload;
      // TODO Popravi
      return {
        ...state,
        activeGroup: null,
        formMode: FormMode.None,
        error: undefined,
        whichRowId: undefined
      };
    }

    case ActionTypes.CANCEL_GROUP_FORM:
    case ActionTypes.CLOSE_GROUP_FORM: {
      return {
        ...state,
        formMode: FormMode.None
      };
    }


    // First we add a new answer to the group.guestions
    // After user clicks Save, we call createAnswer 
    /*
    case ActionTypes.ADD_ANSWER: {
      const { groupInfo } = action.payload;
      const { groupKey, level } = groupInfo;
      const { partitionKey, id } = groupKey;
      const answer: IAnswer = {
        ...initialAnswer,
        partitionKey: id ?? '',
        parentGroup: id,
        inAdding: true
      }
      return {
        ...state,
        mode: Mode.AddingAnswer,
        activeAnswer: answer
      };
    }
    */

    case ActionTypes.GROUP_TITLE_CHANGED: {
      const { value, id } = action.payload;
      const { topRows: topGroupRows } = state;
      const groupRow: IGroupRow | undefined = findGroup(topGroupRows, id);
      if (groupRow) {
        groupRow.title = value;
      }
      return {
        ...state,
      };
    }

    case ActionTypes.ANSWER_TITLE_CHANGED: {
      const { groupId, id, value } = action.payload;
      const { topRows: topGroupRows } = state;
      const groupRow: IGroupRow | undefined = findGroup(topGroupRows, groupId);
      if (groupRow) {
        groupRow.answerRows.find(q => q.id === id)!.title = value;
      }
      return {
        ...state,
      };
    }

    case ActionTypes.CANCEL_ADD_SUB_GROUP: {
      return {
        ...state,
        activeGroup: null,
        activeAnswer: null,
        formMode: FormMode.None
      };
    }

    case ActionTypes.CANCEL_ADD_ANSWER: {
      return {
        ...state,
        formMode: FormMode.None,
        activeAnswer: null
      };
    }

    case ActionTypes.SET_ANSWER: {
      const { answer, formMode } = action.payload;
      console.log(ActionTypes.SET_ANSWER, answer)
      return {
        ...state,
        activeGroup: null,
        activeAnswer: answer,
        formMode,
        error: undefined,
        loading: false
      };
    }

    case ActionTypes.SET_ANSWER_AFTER_ASSIGN_ANSWER: {
      const { answer } = action.payload;
      const { parentGroup, id } = answer;
      const inAdding = state.formMode === FormMode.AddingAnswer;

      // for inAdding, _id is IDBValidKey('000000000000000000000000')
      // thats why we look for q.inAdding instead of q._id === _id
      // const x = state.groups.filter(c => c.id === parentGroup).filter(q=>q.id === id);
      // console.error('SET_ANSWER_AFTER_ASSIGN_ANSWER', {x})

      // TODO Popravi
      // const rootGroupRows = newTopGroupRows.map((c: IGroup) => c.id === parentGroup
      //   ? {
      //     ...c,
      //     answerRows: inAdding
      //       ? c.answerRows.map(q => q.inAdding ? { ...answer, inAdding: q.inAdding } : q)
      //       : c.answerRows.map(q => q.id === id ? { ...answer } : q), // TODO sta, ako je inViewing
      //     inAdding: c.inAdding
      //   }
      //   : c
      // );
      return {
        ...state,
        //formMode: state.formMode, // keep mode
        activeAnswer: answer,
        loading: false
      };
    }


    case ActionTypes.SET_ANSWER_TO_VIEW: {
      const { answer } = action.payload;
      const { partitionKey, id, parentGroup } = answer;
      const { keyExpanded: groupKeyExpanded } = state;
      return {
        ...state,
        formMode: FormMode.ViewingAnswer,
        loading: false,
        keyExpanded: groupKeyExpanded
          ? { ...groupKeyExpanded, answerId: groupKeyExpanded.id === parentGroup ? id : null }
          : null,
        activeAnswer: answer
      }
    }

    case ActionTypes.SET_ANSWER_TO_EDIT: {
      const { answer } = action.payload;
      const { partitionKey, id, parentGroup } = answer;
      const { keyExpanded: groupKeyExpanded } = state;
      return {
        ...state,
        loading: false,
        // groupKeyExpanded: groupKeyExpanded
        //   ? { ...groupKeyExpanded, answerId: groupKeyExpanded.id === parentGroup ? id : null }
        //   : null,
        //groupKeyExpanded: { partitionKey: parentGroup, id: parentGroup, answerId: id },
        activeAnswer: answer,
        formMode: FormMode.EditingAnswer
      }
    }

    case ActionTypes.DELETE_ANSWER: {
      const { answer } = action.payload;
      const { parentGroup, id } = answer;
      return {
        ...state, // Popravi
        // groupKeyExpanded: newRootGroupRows.map((c: IGroup) => c.id === parentGroup
        //   ? {
        //     ...c,
        //     answerRows: c.answerRows.filter(q => q.id !== id)
        //   }
        //   : c
        // ),
        activeAnswer: null,
        formMode: FormMode.None
      }
    }

    case ActionTypes.CANCEL_ANSWER_FORM:
    case ActionTypes.CLOSE_ANSWER_FORM: {
      const { answer } = action.payload;
      return {
        ...state,
        formMode: FormMode.None,
        activeAnswer: null
      };
    }

    default:
      return state;  // TODO throw error
  }
};


function findGroup(groupRows: IGroupRow[], id: string): IGroupRow | undefined {
  let group: IGroupRow | undefined = groupRows.find(c => c.id === (id ?? 'null'));
  if (!group) {
    try {
      groupRows.forEach(g => {
        group = findGroup(g.groupRows, id);
        if (group) {
          throw new Error("Stop the loop");
        }
      })
    }
    catch (e) {
      console.log("Loop stopped");
    }
  }
  return group;
}

export class DeepClone {
  static idToSet: string;
  static newGroupRow: IGroupRow;
  constructor(groupRow: IGroupRow) {
    const { partitionKey, id, rootId, parentGroup, title, link, kind, header, level, variations, numOfAnswers,
      hasSubGroups, groupRows, answerRows, created, modified, isExpanded } = groupRow;

    let isBroken = false;
    const subGroupRows = groupRows.map((groupRow: IGroupRow) => {
      if (isBroken)
        return groupRow;
      if (groupRow.id === DeepClone.idToSet) {
        isBroken = true;
        return { ...DeepClone.newGroupRow }
      }
      else {
        return new DeepClone(groupRow).groupRow
      }
    });

    this.groupRow = {
      partitionKey,
      id,
      kind,
      rootId,
      parentGroup,
      title,
      link,
      header,
      level,
      hasSubGroups,
      groupRows: subGroupRows,
      numOfAnswers,
      answerRows,
      variations: variations ?? [],
      created,
      modified,
      isExpanded
    }
  }
  groupRow: IGroupRow;
}


