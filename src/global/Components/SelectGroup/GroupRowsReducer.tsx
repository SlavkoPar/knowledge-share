import React, { Reducer } from 'react'
import { GroupRowsActions, GroupRowsActionTypes, IGroupRowsState } from './types';
import { IGroupRow } from 'groups/types';

export const initialState: IGroupRowsState = {
  loading: false,
  parentId: null,
  title: '',
  groupRows: []
}

export const GroupRowsReducer: Reducer<IGroupRowsState, GroupRowsActions> = (state, action) => {

  switch (action.type) {
    case GroupRowsActionTypes.SET_LOADING:
      return {
        ...state,
        loading: true
      }

    case GroupRowsActionTypes.SET_SUB_GROUPS: {
      const { subGroupRows } = action.payload;
      return {
        ...state,
        groupRows: state.groupRows.concat(subGroupRows),
        loading: false
      }
    }

    case GroupRowsActionTypes.SET_ERROR: {
      const { error } = action.payload;
      return { ...state, error, loading: false };
    }

    case GroupRowsActionTypes.SET_EXPANDED: {
      const { id, expanding } = action.payload;
      let { groupRows } = state;
      if (!expanding) {
        const ids = markForClean(groupRows, id!)
        console.log('clean:', ids)
        if (ids.length > 0) {
          groupRows = groupRows.filter(c => !ids.includes(c.id))
        }
      }
      return {
        ...state,
        groupRows: state.groupRows.map(c => c.id === id
          ? { ...c, isExpanded: expanding }
          : c
        )
      };
    }

    case GroupRowsActionTypes.SET_PARENT_SHORTGROUP: {
      const { shortGroup } = action.payload;
      const { id, title } = shortGroup;
      return {
        ...state,
        parentId: id!,
        title
      };
    }

    default:
      return state;  // TODO throw error
  }
};


function markForClean(groupRows: IGroupRow[], id: string | null) {
  let deca = groupRows
    .filter(c => c.parentId === id)
    .map(c => c.id)

  deca.forEach(id => {
    const unuci = id ? markForClean(groupRows, id) : [];
    deca = deca.concat(unuci);
  })
  return deca
}