import React, { Reducer } from 'react'
import { IShortGroup } from "global/types";
import { ShortGroupsActions, ShortGroupsActionTypes, IShortGroupsState } from './types';

export const initialState: IShortGroupsState = {
  loading: false,
  parentGroup: null,
  title: '',
  shortGroups: []
}

export const ShortGroupsReducer: Reducer<IShortGroupsState, ShortGroupsActions> = (state, action) => {

  switch (action.type) {
    case ShortGroupsActionTypes.SET_LOADING:
      return {
        ...state,
        loading: true
      }

    case ShortGroupsActionTypes.SET_SUB_SHORTGROUPS: {
      const { subShortGroups } = action.payload;
      return {
        ...state,
        shortGroups: state.shortGroups.concat(subShortGroups),
        loading: false
      }
    }

    case ShortGroupsActionTypes.SET_ERROR: {
      const { error } = action.payload;
      return { ...state, error, loading: false };
    }

    case ShortGroupsActionTypes.SET_EXPANDED: {
      const { id, expanding } = action.payload;
      let { shortGroups } = state;
      if (!expanding) {
        const ids = markForClean(shortGroups, id!)
        console.log('clean:', ids)
        if (ids.length > 0) {
          shortGroups = shortGroups.filter(c => !ids.includes(c.id))
        }
      }
      return {
        ...state,
        shortGroups: state.shortGroups.map(c => c.id === id
          ? { ...c, isExpanded: expanding }
          : c
        )
      };
    }

    case ShortGroupsActionTypes.SET_PARENT_SHORTGROUP: {
      const { shortGroup } = action.payload;
      const { id, title } = shortGroup;
      return {
        ...state,
        parentGroup: id!,
        title
      };
    }

    default:
      return state;  // TODO throw error
  }
};


function markForClean(shortGroups: IShortGroup[], id: string | null) {
  let deca = shortGroups
    .filter(c => c.parentGroup === id)
    .map(c => c.id)

  deca.forEach(id => {
    const unuci = id ? markForClean(shortGroups, id) : [];
    deca = deca.concat(unuci);
  })
  return deca
}