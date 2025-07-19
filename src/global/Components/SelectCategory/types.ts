import { ICategory, ICategoryKey, ICategoryRow, IQuestion, IQuestionEx, IQuestionKey, IQuestionRow } from 'categories/types';

import { ActionMap } from "global/types";

/////////////////////////////////////////////////////////////////////////
// DropDown Select Category

export interface ICatsState {
	loading: boolean,
	parentId: string | null,
	title: string,
	cats: ICategoryRow[], // drop down categories
	error?: Error;
}

export interface ICatInfo {
	selId: string | null;
	categoryKey: ICategoryKey | null,
	level: number,
	setParentId: (cat: ICategoryRow) => void;
}

export enum CatsActionTypes {
	SET_LOADING = 'SET_LOADING',
	SET_SUB_CATS = 'SET_SUB_CATS',
	SET_ERROR = 'SET_ERROR',
	SET_EXPANDED = 'SET_EXPANDED',
	SET_PARENT_CAT = 'SET_PARENT_CAT'
}

export type CatsPayload = {
	[CatsActionTypes.SET_LOADING]: false;

	[CatsActionTypes.SET_SUB_CATS]: {
		subCats: ICategoryRow[];
	};

	[CatsActionTypes.SET_EXPANDED]: {
		id: string;
		expanding: boolean;
	}

	[CatsActionTypes.SET_ERROR]: {
		error: Error;
	};

	[CatsActionTypes.SET_PARENT_CAT]: {
		cat: ICategoryRow;
	};

};

export type CatsActions =
	ActionMap<CatsPayload>[keyof ActionMap<CatsPayload>];



export type CatActions = ActionMap<CatsPayload>[keyof ActionMap<CatsPayload>];