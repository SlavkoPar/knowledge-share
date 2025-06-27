import { IGroup, IGroupKey, IAnswer, IAnswerEx, IAnswerKey, IAnswerRow } from 'groups/types';

import { ActionMap, IShortGroup } from "global/types";



/////////////////////////////////////////////////////////////////////////
// DropDown Select Group

export interface IShortGroupsState {
	loading: boolean,
	parentGroup: string | null,
	title: string,
	shortGroups: IShortGroup[], // drop down groups
	error?: Error;
}


export enum ShortGroupsActionTypes {
	SET_LOADING = 'SET_LOADING',
	SET_SUB_SHORTGROUPS = 'SET_SUB_SHORTGROUPS',
	SET_ERROR = 'SET_ERROR',
	SET_EXPANDED = 'SET_EXPANDED',
	SET_PARENT_SHORTGROUP = 'SET_PARENT_SHORTGROUP'
}

export type ShortGroupsPayload = {
	[ShortGroupsActionTypes.SET_LOADING]: false;

	[ShortGroupsActionTypes.SET_SUB_SHORTGROUPS]: {
		subShortGroups: IShortGroup[];
	};

	[ShortGroupsActionTypes.SET_EXPANDED]: {
		id: string;
		expanding: boolean;
	}

	[ShortGroupsActionTypes.SET_ERROR]: {
		error: Error;
	};

	[ShortGroupsActionTypes.SET_PARENT_SHORTGROUP]: {
		shortGroup: IShortGroup;
	};

};

export type ShortGroupsActions =
	ActionMap<ShortGroupsPayload>[keyof ActionMap<ShortGroupsPayload>];

export type ShortGroupActions = ActionMap<ShortGroupsPayload>[keyof ActionMap<ShortGroupsPayload>];