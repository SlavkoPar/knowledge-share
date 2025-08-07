import React, { Reducer } from 'react'
import { ICategoryRow } from "categories/types";
import { CatsActions, CatActionTypes, ICatState } from './types';

export const initialState: ICatState = {
  loading: false,
  parentId: null,
  title: '',
  cats: []
}

export const CatReducer: Reducer<ICatState, CatsActions> = (state, action) => {

  switch (action.type) {
    case CatActionTypes.SET_LOADING:
      return {
        ...state,
        loading: true
      }

    case CatActionTypes.SET_SUB_CATS: {
      const { subCats } = action.payload;
      return {
        ...state,
        cats: state.cats.concat(subCats),
        loading: false
      }
    }

    case CatActionTypes.SET_ERROR: {
      const { error } = action.payload;
      return { ...state, error, loading: false };
    }

    case CatActionTypes.SET_EXPANDED: {
      const { id, expanding } = action.payload;
      let { cats } = state;
      if (!expanding) {
        const ids = markForClean(cats, id!)
        console.log('clean:', ids)
        if (ids.length > 0) {
          cats = cats.filter(c => !ids.includes(c.id))
        }
      }
      return {
        ...state,
        cats: state.cats.map(c => c.id === id
          ? { ...c, isExpanded: expanding }
          : c
        )
      };
    }

    case CatActionTypes.SET_PARENT_CAT: {
      const { cat } = action.payload;
      const { id, title } = cat;
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


function markForClean(cats: ICategoryRow[], id: string | null) {
  let deca = cats
    .filter(c => c.parentId === id)
    .map(c => c.id)

  deca.forEach(id => {
    const unuci = id ? markForClean(cats, id) : [];
    deca = deca.concat(unuci);
  })
  return deca
}