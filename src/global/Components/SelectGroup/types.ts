import { ActionMap } from 'global/types';
import { IGroup, IGroupKey, IAnswer, IAnswerEx, IAnswerKey, IAnswerRow, IGroupRow } from 'groups/types';

/////////////////////////////////////////////////////////////////////////
// DropDown Select Group

export interface IGroupRowsState {
	loading: boolean,
	parentGroup: string | null,
	title: string,
	groupRows: IGroupRow[], // drop down categories
	error?: Error;
}

export interface IGroupRowInfo {
	selId: string | null;
	groupKey: IGroupKey | null,
	level: number,
	setParentGroup: (groupRow: IGroupRow) => void;
}


export interface IGroupRowsState {
	loading: boolean,
	parentGroup: string | null,
	title: string,
	groupRows: IGroupRow[], // drop down groups
	error?: Error;
}


export enum GroupRowsActionTypes {
	SET_LOADING = 'SET_LOADING',
	SET_SUB_GROUPS = 'SET_SUB_GROUPS',
	SET_ERROR = 'SET_ERROR',
	SET_EXPANDED = 'SET_EXPANDED',
	SET_PARENT_SHORTGROUP = 'SET_PARENT_SHORTGROUP'
}

export type GroupRowsPayload = {
	[GroupRowsActionTypes.SET_LOADING]: false;

	[GroupRowsActionTypes.SET_SUB_GROUPS]: {
		subGroupRows: IGroupRow[];
	};

	[GroupRowsActionTypes.SET_EXPANDED]: {
		id: string;
		expanding: boolean;
	}

	[GroupRowsActionTypes.SET_ERROR]: {
		error: Error;
	};

	[GroupRowsActionTypes.SET_PARENT_SHORTGROUP]: {
		shortGroup: IGroupRow;
	};

};

export type GroupRowsActions =
	ActionMap<GroupRowsPayload>[keyof ActionMap<GroupRowsPayload>];

export type ShortGroupActions = ActionMap<GroupRowsPayload>[keyof ActionMap<GroupRowsPayload>];