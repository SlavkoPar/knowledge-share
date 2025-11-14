// Define the Global State
import { IAssignedAnswerDtoKey, IAssignedAnswerKey, ICategoryRow, IQuestion, IQuestionDtoKey, IQuestionEx, IQuestionKey, IQuestionRow } from 'categories/types';
import { IGroup, IAnswerRow, IAnswer, IAnswerKey, IGroupRow } from 'groups/types';
//import { IOption } from 'common/types';
import { IDBPDatabase } from 'idb';

export interface IWhoWhen {
	time: Date,
	nickName: string
}

export interface IRecord {
	created?: IWhoWhen;
	modified?: IWhoWhen;
}

export interface IWhoWhenDto {
	Time: Date,
	NickName: string
}

export interface IDto {
	Created?: IWhoWhenDto;
	Modified?: IWhoWhenDto;
}

export interface IDtoKey extends IDto {
	Workspace?: string; // will be set during fetch
	TopId: string,
	Id: string,
	ParentId: string | null;
}

export class Dto2WhoWhen {
	constructor(whoWhenDto?: IWhoWhenDto) {
		if (whoWhenDto) {
			const { Time, NickName } = whoWhenDto;
			this.whoWhen = {
				time: new Date(Time),
				nickName: NickName
			}
		}
	}
	whoWhen?: IWhoWhen = undefined;
}

export class WhoWhen2Dto {
	constructor(whoWhen: IWhoWhen | undefined) {
		if (whoWhen) {
			const { time: date, nickName } = whoWhen;
			this.whoWhenDto = {
				Time: new Date(date),
				NickName: nickName
			}
		}
	}
	whoWhenDto?: IWhoWhenDto = undefined;
}


export class HistoryDto {
	constructor(history: IHistory, Workspace: string) {
		const { questionKey, assignedAnswerKey, created } = history;

		this.historyDto = {
			Workspace,
			QuestionKey: { TopId: questionKey.topId, Id: questionKey.id },
			AnswerKey: { TopId: assignedAnswerKey.topId, Id: assignedAnswerKey.id },
			UserAction: history.userAction,
			Created: new WhoWhen2Dto(created).whoWhenDto!,
		}
	}
	historyDto: IHistoryDto;
}


export class HistoryFilterDto {
	constructor(historyFilter: IHistoryFilter, Workspace: string) {
		const { questionKey, filter, created } = historyFilter;
		this.historyFilterDto = {
			Workspace,
			Filter: filter,
			QuestionKey: { Workspace, TopId: questionKey.topId, Id: questionKey.id },
			Created: new WhoWhen2Dto(created).whoWhenDto!,
		}
	}
	historyFilterDto: IHistoryFilterDto;
}


// export class History {
// 	constructor(dto: IHistoryDto) {
// 		this.history = {
// 			questionKey: dto.QuestionKey,
// 			answerKey: dto.AnswerKey,
// 			userAction: dto.Fixed == 2
// 				? undefined
// 				: dto.Fixed == 1
// 					? true
// 					: false,
// 			created: new Dto2WhoWhen(dto.Created!).whoWhen,
// 		}
// 	}
// 	history: IHistory;
// }


export interface IAuthUser {
	color?: string,
	nickName: string,
	name: string;
	email?: string,
	role?: ROLES,
	visited?: Date
}

// export const ROLES: Map<string, string> = new Map<string, string>([
// 	['OWNER', 'OWNER'],
// 	['ADMIN', 'ADMIN'],
// 	['EDITOR', 'EDITOR'],
// 	['VIEWER', 'VIEWER']
// ])

export enum ROLES {
	OWNER = 'OWNER',
	ADMIN = 'ADMIN',
	EDITOR = 'EDITOR',
	VIEWER = 'VIEWER'
}


// export interface IShortGroup {
// 	topId: string,
// 	id: string;
// 	parentId: string | null;
// 	header: string;
// 	title: string;
// 	titlesUpTheTree: string; // traverse up the tree, until root
// 	hasSubGroups: boolean;
// 	level: number;
// 	kind: number;
// 	isExpanded: boolean;
// }


export interface IGlobalState {
	KnowledgeAPI: {
		endpointCategoryRow: string;
		endpointCategory: string;
		endpointQuestion: string;
		endpointQuestionAnswer: string;
		//endpointShortGroup: : string;
		endpointGroupRow: string;
		endpointGroup: string;
		endpointAnswer: string;
		endpointHistory: string;
		endpointHistoryFilter: string;
	};
	isAuthenticated: boolean | null;
	workspace: string;
	dbp: IDBPDatabase | null;
	everLoggedIn: boolean;
	authUser: IAuthUser;
	canEdit: boolean,
	isOwner: boolean,
	isDarkMode: boolean;
	variant: string,
	bg: string,
	loading: boolean;
	error?: Error;
	allCategoryRowsGlobal: Map<string, ICategoryRow>;
	allCategoryRowsGlobalLoaded?: number;
	allGroupRows: Map<string, IGroupRow>;
	allGroupRowsLoaded?: number;
	nodesReLoaded: boolean; // categoryNodeLoaded || groupNodeLoaded  ( to prevent showing of ChatBotDlg)
	lastRouteVisited: string;
}


export interface ILocStorage {
	nickName: string;
	everLoggedIn: boolean;
	isDarkMode: boolean;
	variant: string;
	bg: string;
	lastRouteVisited: string;
}

export interface IParentInfo {
	parentId: string,
	title?: string, // to easier follow getting the list of sub-categories
	level: number
}


export interface IGlobalContext {
	globalState: IGlobalState;
	getUser: (nickName: string) => Promise<any>;
	//OpenDB: () => Promise<any>;
	setLastRouteVisited: (lastRouteVisited: string) => void;
	health: () => void;
	loadAllCategoryRowsGlobal: () => Promise<boolean>;
	getCat: (categoryId: string) => Promise<ICategoryRow | undefined>;
	getSubCats: (categoryId: string | null) => Promise<any>;
	getCatsByKind: (kind: number) => Promise<ICategoryRow[]>;
	searchQuestions: (filter: string, count: number) => Promise<IQuestionRow[]>;
	getQuestion: (questionKey: IQuestionKey) => Promise<IQuestionEx>;
	loadAndCacheAllGroupRows: () => Promise<boolean>;
	getGroupRows: (categoryId: string | null) => Promise<any>;
	globalGetGroupRow: (groupRowId: string) => Promise<IGroupRow | undefined>;
	getGroupRowsByKind: (kind: number) => Promise<IGroupRow[]>;
	searchAnswers: (filter: string, count: number, questionKey?: IQuestionKey) => Promise<IAnswerRow[]>;
	getAnswer: (answerKey: IAnswerKey) => Promise<IAnswer | null>;
	addHistory: (history: IHistory) => Promise<void>;
	getAnswersRated: (questionKey: IQuestionKey) => Promise<any>;
	addHistoryFilter: (historyFilter: IHistoryFilter) => Promise<void>;
	setNodesReloaded: () => void;
}

export enum GlobalActionTypes {
	SET_LOADING = 'SET_LOADING',
	SET_FROM_LOCAL_STORAGE = "SET_FROM_LOCAL_STORAGE",
	AUTHENTICATE = "AUTHENTICATE",
	UN_AUTHENTICATE = "UN_AUTHENTICATE",
	SET_DBP = "SET_DBP",
	SET_ERROR = 'SET_ERROR',
	DARK_MODE = "DARK_MODE",
	LIGHT_MODE = "LIGHT_MODE",
	SET_ALL_CATEGORY_ROWS_GLOBAL = 'SET_ALL_CATEGORY_ROWS_GLOBAL',
	SET_ALL_GROUP_ROWS = 'SET_ALL_GROUP_ROWS',
	SET_NODES_RELOADED = 'SET_NODES_RELOADED',
	SET_QUESTION_AFTER_ASSIGN_ANSWER = 'SET_QUESTION_AFTER_ASSIGN_ANSWER',
	SET_LAST_ROUTE_VISITED = 'SET_LAST_ROUTE_VISITED'
}

export interface ILoginUser {
	nickName: string;
	password?: string;
	who?: string;
}

export interface IRegisterUser {
	who?: string,
	nickName: string,
	name: string,
	password: string,
	email: string,
	color: string,
	level: number,
	confirmed: boolean
}

export interface IJoinToWorkspace {
	invitationId: string,
	userName: string;
	password: string;
	date?: Date;
}


export type ActionMap<M extends Record<string, any>> = {
	[Key in keyof M]: M[Key] extends undefined
	? {
		type: Key;
	}
	: {
		type: Key;
		payload: M[Key];
	}
};

export type GlobalPayload = {
	[GlobalActionTypes.SET_LOADING]: {
	};

	[GlobalActionTypes.SET_FROM_LOCAL_STORAGE]: {
		locStorage: ILocStorage
	};


	[GlobalActionTypes.AUTHENTICATE]: {
		user: IUser
	};

	[GlobalActionTypes.UN_AUTHENTICATE]: undefined;

	[GlobalActionTypes.SET_DBP]: {
		dbp: IDBPDatabase | null
	};

	[GlobalActionTypes.SET_ERROR]: {
		error: Error;
	};

	[GlobalActionTypes.LIGHT_MODE]: undefined;

	[GlobalActionTypes.DARK_MODE]: undefined;

	[GlobalActionTypes.SET_ALL_CATEGORY_ROWS_GLOBAL]: {
		allCategoryRows: Map<string, ICategoryRow>
	};

	[GlobalActionTypes.SET_ALL_GROUP_ROWS]: {
		allGroupRows: Map<string, IGroupRow>
	};

	[GlobalActionTypes.SET_NODES_RELOADED]: undefined;

	[GlobalActionTypes.SET_QUESTION_AFTER_ASSIGN_ANSWER]: {
		question: IQuestion
	};

	[GlobalActionTypes.SET_LAST_ROUTE_VISITED]: {
		lastRouteVisited: string
	};
};



export interface IShortGroupsState {
	loading: boolean,
	parentId: string | null,
	title: string,
	shortGroups: IGroup[], // drop down groups
	error?: Error;
}

// export interface IShortGroupInfo {
// 	groupKey: IGroupKey | null,
// 	level: number,
// 	setParentGroup: (group: IShortGroup) => void;
// }


export enum ShortGroupsActionTypes {
	SET_LOADING = 'SET_LOADING',
	SET_SUB_SHORTGROUPS = 'SET_SUB_SHORTGROUPS',
	SET_ERROR = 'SET_ERROR',
	SET_EXPANDED = 'SET_EXPANDED',
	SET_PARENT_SHORTGROUP = 'SET_PARENT_SHORTGROUP'
}



export type ShortGroupsPayload = {
	[ShortGroupsActionTypes.SET_LOADING]: undefined;

	[ShortGroupsActionTypes.SET_SUB_SHORTGROUPS]: {
		groups: IGroup[];
	};

	[ShortGroupsActionTypes.SET_EXPANDED]: {
		id: string;
		expanding: boolean;
	}

	[ShortGroupsActionTypes.SET_ERROR]: {
		error: Error;
	};

	[ShortGroupsActionTypes.SET_PARENT_SHORTGROUP]: {
		group: IGroup;
	};

};

export type ShortGroupsActions =
	ActionMap<ShortGroupsPayload>[keyof ActionMap<ShortGroupsPayload>];


////////////////////////
// Category -> questions
export interface IQuestionData {
	title: string;
	assignedAnswers?: number[];
	source?: number;
	status?: number;
	variations?: string[]
}

export interface ICategoryData {
	id: string;
	title: string;
	kind?: number;
	variations?: string[];
	categories?: ICategoryData[],
	questions?: IQuestionData[]
}


////////////////////
// Group -> answers
export interface IAnswerData {
	title: string;
	source?: number;
	status?: number;
}

export interface IGroupData {
	id: string,
	title: string,
	groups?: IGroupData[],
	answers?: IAnswerData[]
}

////////////////////
// Role -> users
export interface IUserData {
	nickName: string;
	name: string;
	password: string;
	email: string;
	color: string;
}

export interface IRoleData {
	title: string,
	roles?: IRoleData[],
	users?: IUserData[]
}



export type USER_ANSWER_ACTION = 'NotFixed' | 'Fixed' | 'NotClicked';


export interface IHistory {
	id?: number;
	questionKey: IQuestionKey;
	assignedAnswerKey: IAssignedAnswerKey;
	userAction: USER_ANSWER_ACTION; // when client didn't click on 'Fixed' or 'Not fixed' buttons
	created?: IWhoWhen
}

export interface IHistoryDto {
	Workspace: string,
	PartitionKey?: string;
	Id?: number;
	QuestionKey: IQuestionDtoKey;
	AnswerKey: IAssignedAnswerDtoKey;
	UserAction: USER_ANSWER_ACTION; // when client didn't click on 'Fixed' or 'Not fixed' buttons
	Created: IWhoWhenDto
}



export interface IHistoryFilter {
	Workspace?: string,
	questionKey: IQuestionKey;
	filter: string;
	created: IWhoWhen
}

export interface IHistoryFilterDto {
	Workspace?: string,
	QuestionKey: IQuestionDtoKey;
	Filter: string;
	Created: IWhoWhenDto
}


export interface IHistoryDtoEx {
	historyDto: IHistoryDto | null;
	msg: string;
}

export interface IHistoryDtoListEx {
	historyDtoList: IHistoryDto[];
	msg: string;
}

export interface IHistoryListEx {
	historyList: IHistory[];
	msg: string;
}


export interface IHistoryData {
	client: string;
	questionId: number;
	answerId: number;
	created?: Date
}


export interface IUser {
	workspace: string;
	nickName: string;
	name: string;
	color?: string;
	level?: number;
	isDarkMode?: boolean;
}


export type GlobalActions = ActionMap<GlobalPayload>[keyof ActionMap<GlobalPayload>];