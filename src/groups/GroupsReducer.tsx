import { Reducer } from 'react'
import { Mode, ActionTypes, IGroupsState, IGroup, IAnswer, GroupsActions, ILocStorage, IGroupKey, IGroupKeyExtended, IAnswerRow, Answer, IAnswerRowDto, IAnswerKey, GroupKey, AnswerKey } from "groups/types";

export const initialAnswer: IAnswer = {
  partitionKey: '',
  id: 'will be given by DB',
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
  parentGroup: 'null',
  hasSubGroups: false,
  answerRows: [],
  numOfAnswers: 0,
  hasMoreAnswers: false,
  isExpanded: false
}

export const initialState: IGroupsState = {
  mode: Mode.NULL,
  groups: [],
  groupNodesUpTheTree: [],
  groupKeyExpanded: {
    partitionKey: "TELEVISIONS",
    id: "TELEVISIONS",
    answerId: "aaaaaa112"
  },
  groupId_answerId_done: undefined,
  loading: false,
  answerLoading: false,
  groupNodeReLoading: false,
  groupNodeLoaded: false, //true  TODO izmeni nakon testa
  groupInViewingOrEditing: null,
  answerInViewingOrEditing: null
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
    const groupNodeLoaded = lastGroupKeyExpanded ? false : true;
    initialGroupsState = {
      ...initialGroupsState,
      groupKeyExpanded: { ...lastGroupKeyExpanded },
      groupNodeLoaded
    }
    console.log('initialGroupsState nakon citanja iz memorije', initialGroupsState);
  }
}

export { initialGroupsState };

export const GroupsReducer: Reducer<IGroupsState, GroupsActions> = (state, action) => {

  console.log('------------------------------->', action.type)
  const newState = reducer(state, action);

  const aTypesToStore = [
    ActionTypes.SET_EXPANDED,
    ActionTypes.SET_COLLAPSED,
    ActionTypes.VIEW_GROUP,
    ActionTypes.EDIT_GROUP,
    ActionTypes.VIEW_ANSWER,
    ActionTypes.EDIT_ANSWER,
    ActionTypes.SET_GROUP_NODES_UP_THE_TREE
  ];

  const { groupKeyExpanded } = newState;
  const locStorage: ILocStorage = {
    lastGroupKeyExpanded: groupKeyExpanded
  }
  if (aTypesToStore.includes(action.type)) {
    localStorage.setItem('GROUPS_STATE', JSON.stringify(locStorage));
  }
  return newState;
}

const reducer = (state: IGroupsState, action: GroupsActions) => {
  switch (action.type) {

    case ActionTypes.SET_LOADING:
      return {
        ...state,
        loading: true
      }

    case ActionTypes.SET_GROUP_LOADING:
      const { id, loading } = action.payload; // group doesn't contain inAdding 
      return {
        ...state,
        loading
      }

    case ActionTypes.SET_GROUP_ANSWERS_LOADING:
      const { answerLoading } = action.payload; // group doesn't contain inAdding 
      return {
        ...state,
        answerLoading
      }


    case ActionTypes.GROUP_NODE_RE_LOADING: {
      return {
        ...state,
        groupNodeReLoading: true
      }
    }

    case ActionTypes.RESET_GROUP_ANSWER_DONE: {
      return {
        ...state,
        groupId_answerId_done: undefined,
        groupNodeLoaded: false
      };
    }

    case ActionTypes.SET_GROUP_NODES_UP_THE_TREE: {
      const { groupNodesUpTheTree, groupKeyExpanded, fromChatBotDlg } = action.payload;
      const { id, answerId } = groupKeyExpanded;
      console.log('====== >>>>>>> GroupsReducer ActionTypes.SET_GROUP_NODES_UP_THE_TREE payload ', action.payload)
      return {
        ...state,
        groups: fromChatBotDlg ? [] : [...state.groups],
        groupNodesUpTheTree,
        groupId_answerId_done: `${id}_${answerId}`,
        groupNodeLoading: false,
        groupNodeLoaded: true,
        loading: false,
        groupKeyExpanded,
        mode: Mode.NULL // reset previosly selected form
      };
    }

    case ActionTypes.SET_SUB_GROUPS: {
      const { subGroups } = action.payload;
      const { groupNodesUpTheTree, groups } = state;
      const ids = groupNodesUpTheTree.map(c => c.id);
      let idRemove: string = '';
      console.log('===========>>>>>>>>>> GroupsReducer ActionTypes.SET_SUB_GROUPS', { ids, subGroups })
      subGroups.forEach((subGroup: IGroup) => {
        const { id, hasSubGroups, numOfAnswers } = subGroup;
        if (ids.length > 0) {
          if (ids.includes(id)) {
            idRemove = id;
            if (hasSubGroups || numOfAnswers > 0) {
              subGroup.isExpanded = true;
              subGroup.isSelected = false;
            }
            else {
              subGroup.isExpanded = false;
              subGroup.isSelected = true;
            }
          }
        }
      })
      return {
        ...state,
        groups: groups.concat(subGroups),
        groupNodesUpTheTree: groupNodesUpTheTree.filter(c => c.id !== idRemove),
        loading: false
      };
    }

    case ActionTypes.CLEAN_SUB_TREE: {
      const { groupKey } = action.payload;
      if (groupKey === null) {
        return {
          ...state,
          groupKeyExpanded: null,
          groupNodeLoaded: false,
          groups: []
        }
      }
      else {
        const ids = markForClean(state.groups, groupKey.id);
        console.log('CLEAN_SUB_TREE:', ids)
        if (ids.length === 0)
          return {
            ...state,
            //groupKeyExpanded: null
          }
        else
          return {
            ...state,
            //groupKeyExpanded: null,
            groups: state.groups.filter(c => !ids.includes(c.id))
          }
      }
    }

    case ActionTypes.CLEAN_TREE: {
      return {
        ...state,
        groups: []
      }
    }

    case ActionTypes.SET_ERROR: {
      const { error, whichRowId } = action.payload; // group.id or answer.id
      return {
        ...state,
        error,
        whichRowId,
        loading: false,
        answerLoading: false,
        groupNodeLoading: false
      };
    }

    case ActionTypes.ADD_SUB_GROUP: {
      const { groupKey, level } = action.payload;
      const { partitionKey, id } = groupKey;
      const group: IGroup = {
        ...initialGroup,
        level,
        partitionKey: partitionKey!,
        parentGroup: id,
      }
      return {
        ...state,
        groups: [...state.groups, group],
        mode: Mode.AddingGroup
      };
    }

    case ActionTypes.SET_ADDED_GROUP: {
      const { group } = action.payload;
      return {
        ...state,
        mode: Mode.NULL,
        loading: false
      }
    }

    case ActionTypes.SET_GROUP: {
      const { group } = action.payload; // group doesn't contain  inAdding 
      console.log('@@@@@@@@@@ SET_GROUP', { group })
      const { id } = group;
      /* TODO sredi kasnije 
      const cat = state.groups.find(c => c.id === id);
      const answerInAdding = cat!.answers.find(q => q.inAdding);
      if (answerInAdding) {
        answers.unshift(answerInAdding); // TODO mislim da ovo treba comment
        console.assert(state.mode === Mode.AddingAnswer, "expected Mode.AddingAnswer")
      }
      */
      return {
        ...state,
        groups: state.groups.map((c: IGroup) => c.id === id
          ? {
            ...group,
            isExpanded: c.isExpanded
          }
          : c),
        answerInViewingOrEditing: null,
        // keep mode
        loading: false
      }
    }

    case ActionTypes.VIEW_GROUP: {
      const { group } = action.payload;
      //const { isExpanded } = group;
      group.isExpanded = false;
      console.log('===>>> ActionTypes.VIEW_GROUP', group)
      const { partitionKey, id, parentGroup } = group;
      return {
        ...state,
        //groups: resetRows(state.groups, group.id, { isSelected: true, isExpanded: false, answerRows: [], numOfAnswers: 0 }),
        groups: resetGroup(state.groups, group.id),
        mode: Mode.ViewingGroup,
        loading: false,
        groupKeyExpanded: state.groupKeyExpanded ? { ...state.groupKeyExpanded, answerId: null } : null,
        groupInViewingOrEditing: group,
        answerInViewingOrEditing: null
      };
    }

    case ActionTypes.EDIT_GROUP: {
      const { group } = action.payload;
      group.isExpanded = false;
      const { partitionKey, id, parentGroup } = group;
      const groups = resetGroup(state.groups, group.id);
      console.log('===>>> ActionTypes.EDIT_GROUP', { group }, { groups })
      return {
        ...state,
        groups,
        mode: Mode.EditingGroup,
        loading: false,
        groupKeyExpanded: state.groupKeyExpanded ? { ...state.groupKeyExpanded, answerId: null } : null,
        groupInViewingOrEditing: group,
        answerInViewingOrEditing: null
      };
    }

    case ActionTypes.LOAD_GROUP_ANSWERS: {
      const { id, answerRows, hasMoreAnswers } = action.payload; // group doesn't contain inAdding 
      console.log('>>>>>>>>>>>>LOAD_GROUP_ANSWERS', { id, answerRows, hasMoreAnswers })
      const group = state.groups.find(c => c.id === id);
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
        groups: state.groups.map((c: IGroup) => c.id === id
          ? {
            ...c,
            answerRows: c.answerRows.concat(answerRows),
            hasMoreAnswers,
            isExpanded: c.isExpanded
          }
          : c),
        // keep mode
        answerLoading: false
      }
    }

    case ActionTypes.DELETE: {
      const { id } = action.payload;
      return {
        ...state,
        mode: Mode.NULL,
        groups: state.groups.filter(c => c.id !== id),
        error: undefined,
        whichRowId: undefined
      };
    }

    case ActionTypes.SET_EXPANDED: {
      const { groupKey } = action.payload;
      let { groups } = state;
      console.log('ActionTypes.SET_EXPANDED:', { groupKey })
      return {
        ...state,
        groups: groups.map((c: IGroup) => c.id === groupKey.id
          ? { ...c, isExpanded: true }
          : c
        ),
        loading: false,
        mode: Mode.NULL, // : state.mode,// expanding ? state.mode : Mode.NULL,  // TODO  close form only if inside of colapsed node
        groupKeyExpanded: { ...groupKey, answerId: null },
        groupNodeLoaded: true, // prevent reloadGroupNode
      };
    }

    case ActionTypes.SET_COLLAPSED: {
      const { groupKey } = action.payload;
      const { partitionKey, id } = groupKey;
      let { groups } = state;

      const ids = markForClean(groups, groupKey.id)
      console.log('clean:', ids)
      if (ids.length > 0) {
        groups = groups.filter(c => !ids.includes(c.id))
      }
      return {
        ...state,
        groups: groups.map((c: IGroup) => c.id === id
          ? { ...c, isExpanded: false }
          : c
        ),
        loading: false,
        //mode: state.mode,// expanding ? state.mode : Mode.NULL,  // TODO  close form only if inside of colapsed node
        groupKeyExpanded: { ...groupKey, answerId: null }
        // mode: Mode.NULL, // : state.mode,// expanding ? state.mode : Mode.NULL,  // TODO  close form only if inside of colapsed node

        //groupNodeLoaded: true // prevent reloadGroupNode
      };
    }

    // First we add a new answer to the group.guestions
    // After user clicks Save, we call createAnswer 
    case ActionTypes.ADD_ANSWER: {
      const { groupInfo } = action.payload;
      const { groupKey, level } = groupInfo;
      const { partitionKey, id } = groupKey;
      const answerRow: IAnswerRow = {
        ...initialAnswer,
        partitionKey: id ?? '',
        parentGroup: id,
      }
      return {
        ...state,
        groups: state.groups.map((c: IGroup) => c.id === id
          ? { ...c, answerRows: [answerRow, ...c.answerRows], inAdding: true, numOfAnswers: c.numOfAnswers + 1 }
          : { ...c, inAdding: false }),
        mode: Mode.AddingAnswer
      };
    }

    

    case ActionTypes.SET_VIEWING_EDITING_ANSWER: {
      return {
        ...state,
        groups: state.groups.map((c: IGroup) => ({
          ...c,
          answerRows: c.answerRows.map((q: IAnswerRow) => ({ ...q }))
        })),
        mode: null
      }
    }

    case ActionTypes.VIEW_ANSWER: {
      const { answer } = action.payload;
      const { partitionKey, id, parentGroup } = answer;
      const { groups, groupKeyExpanded } = state;
      const groupProps = undefined;
      return {
        ...state,
        groups: resetRows(state.groups, parentGroup, groupProps, id, { isSelected: true, isExpanded: false }),
        mode: Mode.ViewingAnswer,
        loading: false,
        groupKeyExpanded: groupKeyExpanded
          ? { ...groupKeyExpanded, answerId: groupKeyExpanded.id === parentGroup ? id : null }
          : null,
        answerInViewingOrEditing: answer
      }
    }

    case ActionTypes.EDIT_ANSWER: {
      const { answer } = action.payload;
      const { partitionKey, id, parentGroup } = answer;
      const { groups, groupKeyExpanded } = state;
      const groupProps = undefined;
      return {
        ...state,
        groups: resetRows(state.groups, parentGroup, groupProps, id, { isSelected: true, isExpanded: false }),
        mode: Mode.EditingAnswer,
        loading: false,
        groupKeyExpanded: groupKeyExpanded
          ? { ...groupKeyExpanded, answerId: groupKeyExpanded.id === parentGroup ? id : null }
          : null,
        answerInViewingOrEditing: answer
      }
    }

    case ActionTypes.DELETE_ANSWER: {
      const { answer } = action.payload;
      const { parentGroup, id } = answer;
      return {
        ...state,
        groups: state.groups.map((c: IGroup) => c.id === parentGroup
          ? {
            ...c,
            answerRows: c.answerRows.filter(q => q.id !== id)
          }
          : c
        ),
        mode: Mode.NULL
      }
    }

    

    default:
      return state;  // TODO throw error
  }
};


function resetGroup(groups: IGroup[], groupId: string | null): IGroup[] {
  return groups.map((c: IGroup) => c.id === groupId
    ? {
      ...c,
      //answerRows: []
      //numOfAnswers: 0
      answerRows: c.answerRows.map(q => ({ ...q, isSelected: false })),
      isExpanded: false,
      isSelected: true
    }
    : {
      ...c,
      //isSelected: c.id === groupId      
    }
  )
}

function resetRows(groups: IGroup[],
  id: string | null,
  groupProps?: Object,
  answerId?: string,
  answerRowProps?: Object,
): IGroup[] {
  return groups.map((c: IGroup) => c.id === id
    ? {
      ...c,
      answerRows: c.answerRows.map(q => q.id === answerId
        ? ({ ...q, ...answerRowProps ?? {} })
        : ({ ...q, isSelected: false })),
      ...groupProps
    }
    : {
      ...c,
      answerRows: c.answerRows.map(q => ({ ...q, isSelected: false })),
      //isSelected: c.id === id      
    }
  )
}

function markForClean(groups: IGroup[], id: string | null) {
  let deca = groups
    .filter(c => c.parentGroup === id)
    .map(c => c.id)

  deca.forEach(id => {
    const unuci = id ? markForClean(groups, id) : [];
    deca = deca.concat(unuci);
  })
  return deca
}

