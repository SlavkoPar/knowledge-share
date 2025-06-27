import { ActionMap, IWhoWhen, IRecord, IRecordDto, Dto2WhoWhen, WhoWhen2Dto, IWhoWhenDto, IShortGroup } from 'global/types';

export const Mode = {
	UNDEFINED: undefined,
	NULL: null,
	AddingGroup: 'AddingGroup',
	ViewingGroup: 'ViewingGroup',
	EditingGroup: 'EditingGroup',
	DeletingGroup: 'DeletingGroup',

	// tags
	AddingVariation: 'AddingVariation',
	EditingVariation: 'EditingVariation',
	ViewingVariation: 'ViewingVariation',

	//////////////////////////////////////
	// answers
	AddingAnswer: 'AddingAnswer',
	ViewingAnswer: 'ViewingAnswer',
	EditingAnswer: 'EditingAnswer',
	DeletingAnswer: 'DeletingAnswer',
}

export enum FormMode {
	viewing,
	adding,
	editing
}



/////////////////////////////////////


export interface IAnswerRow extends IRecord {
	partitionKey: string;
	id: string;
	title: string;
	parentGroup: string | null;
	groupTitle?: string;
	isSelected?: boolean;
}

export interface IAnswer extends IAnswerRow {
	source: number;
	status: number;
	link: string;
	//GroupTitle?: string;
}

export interface IGroupKey {
	partitionKey: string | null;
	id: string | null;
}

export interface IGroupKeyExpanded { //extends IGroupKey {
	partitionKey: string | null;
	id: string | null;
	answerId: string | null;
}


export interface IGroupKeyExtended extends IGroupKey {
	title: string;
}


export interface IAnswerKey {
	parentGroup?: string;
	partitionKey: string | null;   // ona day we are going to enable answer
	id: string;
}


export interface IVariation {
	name: string;
}

export interface IGroup extends IRecord {
	partitionKey: string; // | null is a valid value so you can store data with null value in indexeddb 
	id: string;
	kind: number;
	parentGroup: string | null; // | null is a valid value so you can store data with null value in indexeddb 
	title: string;
	link: string | null;
	header: string;
	level: number;
	variations: string[];
	answerRows: IAnswerRow[];
	numOfAnswers: number;
	hasMoreAnswers?: boolean;
	isExpanded?: boolean;
	isSelected?: boolean; // when group has no subGroups
	hasSubGroups: boolean;
	titlesUpTheTree?: string;
}

// export interface IGroup extends IGroupRow {
// }


export class AnswerRow {
	constructor(rowDto: IAnswerRowDto) { //, parentGroup: string) {
		this.answerRow = {
			partitionKey: rowDto.PartitionKey,
			id: rowDto.Id,
			parentGroup: rowDto.ParentGroup,
			title: rowDto.Title,
			groupTitle: rowDto.GroupTitle,
			created: new Dto2WhoWhen(rowDto.Created!).whoWhen,
			modified: rowDto.Modified
				? new Dto2WhoWhen(rowDto.Modified).whoWhen
				: undefined,
			isSelected: rowDto.Included !== undefined
		}
	}
	answerRow: IAnswerRow
}

export class AnswerRowDto {
	constructor(row: IAnswerRow) { //, parentGroup: string) {
		this.answerRowDto = {
			PartitionKey: row.partitionKey,
			Id: row.id,
			ParentGroup: row.parentGroup ?? '',
			Title: '',
			GroupTitle: '',
			Created: new WhoWhen2Dto(row.created!).whoWhenDto!,
			Modified: new WhoWhen2Dto(row.modified).whoWhenDto!,
			Included: row.isSelected
		}
	}
	answerRowDto: IAnswerRowDto
}


export class GroupKey {
	constructor(shortGroup: IShortGroup | IGroup | undefined) {
		this.groupKey = shortGroup
			? {
				partitionKey: shortGroup.partitionKey,
				id: shortGroup.id
			}
			: null
	}
	groupKey: IGroupKey | null;
}

export class Group {
	constructor(dto: IGroupDto) {
		this.group = {
			partitionKey: dto.PartitionKey,
			id: dto.Id,
			kind: dto.Kind,
			parentGroup: dto.ParentGroup!,
			title: dto.Title,
			link: dto.Link,
			header: dto.Header,
			level: dto.Level!,
			variations: dto.Variations ?? [],
			numOfAnswers: dto.NumOfAnswers!,
			hasSubGroups: dto.HasSubGroups!,
			created: new Dto2WhoWhen(dto.Created!).whoWhen,
			modified: dto.Modified
				? new Dto2WhoWhen(dto.Modified).whoWhen
				: undefined,
			answerRows: dto.Answers
				? dto.Answers.map(answerRowDto => new AnswerRow(answerRowDto/*, dto.Id*/).answerRow)
				: []
		}
	}
	group: IGroup;
}


export class GroupDto {
	constructor(group: IGroup) {
		const { partitionKey, id, kind, parentGroup, title, link, header, level, variations, created, modified } = group;
		this.groupDto = {
			PartitionKey: partitionKey,
			Id: id,
			Kind: kind,
			ParentGroup: parentGroup,
			Title: title,
			Link: link,
			Header: header,
			Level: level,
			Variations: variations,
			Created: new WhoWhen2Dto(created).whoWhenDto!,
			Modified: new WhoWhen2Dto(modified).whoWhenDto!
		}
	}
	groupDto: IGroupDto;
}

export class Answer {
	constructor(dto: IAnswerDto) { //, parentGroup: string) {
		// TODO possible to call base class construtor
		this.answer = {
			parentGroup: dto.ParentGroup,
			partitionKey: dto.PartitionKey,
			id: dto.Id,
			title: dto.Title,
			link: dto.Link,
			groupTitle: dto.GroupTitle,
			source: dto.Source ?? 0,
			status: dto.Status ?? 0,
			isSelected: dto.Included !== undefined,
			created: new Dto2WhoWhen(dto.Created!).whoWhen,
			modified: dto.Modified
				? new Dto2WhoWhen(dto.Modified).whoWhen
				: undefined
		}
	}
	answer: IAnswer
}

export class AnswerKey {
	constructor(answer: IAnswer | undefined) {
		this.answerKey = answer
			? {
				partitionKey: answer.partitionKey,
				id: answer.id,
				parentGroup: answer.parentGroup ?? undefined
			}
			: null
	}
	answerKey: IAnswerKey | null;
}

export class AnswerDto {
	constructor(answer: IAnswer) {
		this.answerDto = {
			PartitionKey: answer.partitionKey,
			Id: answer.id,
			ParentGroup: answer.parentGroup ?? 'null',  // TODO proveri
			Title: answer.title,
			Link: answer.link,
			GroupTitle: "",
			Source: answer.source,
			Status: answer.status,
			Created: new WhoWhen2Dto(answer.created).whoWhenDto!,
			Modified: new WhoWhen2Dto(answer.modified).whoWhenDto!
		}
	}
	answerDto: IAnswerDto;
}

export interface IAnswerRowDto extends IRecordDto {
	PartitionKey: string;
	Id: string;
	ParentGroup: string;
	Title: string;
	GroupTitle: string;
	Included?: boolean;
	Source?: number;
	Status?: number;
}

export interface IAnswerDto extends IAnswerRowDto {
	Link: string;
}

export interface IAnswerDtoEx {
	answerDto: IAnswerDto | null;
	msg: string;
}

export interface IAnswerEx {
	answer: IAnswer | null;
	msg: string;
}


export interface IAnswersMore {
	answers: IAnswerDto[];
	hasMoreAnswers: boolean;
}

export interface IGroupDto extends IRecordDto {
	PartitionKey: string;
	Id: string;
	Kind: number;
	ParentGroup: string | null;
	Title: string;
	Link: string | null;
	Header: string;
	Variations: string[];
	Level?: number;
	NumOfAnswers?: number;
	HasSubGroups?: boolean;
	Answers?: IAnswerRowDto[];
	HasMoreAnswers?: boolean;
}

export interface IGroupDtoEx {
	groupDto: IGroupDto | null;
	msg: string;
}


export interface IGroupDtoListEx {
	groupDtoList: IGroupDto[];
	msg: string;
}


export interface IGroupInfo {
	groupKey: IGroupKey;
	level: number
}

export interface IParentInfo {
	//execute?: (method: string, endpoint: string) => Promise<any>,
	// partitionKey: string | null,
	// parentGroup: string | null,
	groupKey: IGroupKey,
	startCursor?: number,
	includeAnswerId?: string | null
	level?: number,
	title?: string, // to easier follow getting the list of sub-groups
	inAdding?: boolean,
}

export interface IGroupsState {
	mode: string | null;
	groups: IGroup[];
	groupNodesUpTheTree: IGroupKeyExtended[];
	groupKeyExpanded: IGroupKeyExpanded | null;
	groupId_answerId_done?: string;
	groupNodeReLoading: boolean;
	groupNodeLoaded: boolean;
	//reloadGroupInfo: IParentGroups;
	loading: boolean;
	answerLoading: boolean,
	error?: Error;
	whichRowId?: string; // group.id or answer.id
	groupInViewingOrEditing: IGroup | null;
	answerInViewingOrEditing: IAnswer | null;
}

export interface ILocStorage {
	lastGroupKeyExpanded: IGroupKeyExpanded | null;
}


export interface IGroupsContext {
	state: IGroupsState,
	reloadGroupNode: (groupKeyExpanded: IGroupKeyExpanded, fromChatBotDlg?: string) => Promise<any>;
	getSubGroups: (groupKey: IGroupKey) => Promise<any>,
	createGroup: (group: IGroup) => void,
	viewGroup: (groupKey: IGroupKey, includeAnswerId: string) => void,
	editGroup: (groupKey: IGroupKey, includeAnswerId: string) => void,
	updateGroup: (group: IGroup, closeForm: boolean) => void,
	deleteGroup: (group: IGroup) => void,
	deleteGroupVariation: (groupKey: IGroupKey, name: string) => void,
	expandGroup: (groupKey: IGroupKey, includeAnswerId: string) => void,
	collapseGroup: (groupKey: IGroupKey) => void,
	//////////////
	// answers
	loadGroupAnswers: (parentInfo: IParentInfo) => void,
	createAnswer: (answer: IAnswer, fromModal: boolean) => Promise<any>;
	viewAnswer: (answerKey: IAnswerKey) => void;
	editAnswer: (answerKey: IAnswerKey) => void;
	updateAnswer: (answer: IAnswer, groupChanged: boolean) => Promise<any>;
	deleteAnswer: (answerRow: IAnswerRow) => void;
}

export interface IGroupFormProps {
	inLine: boolean;
	group: IGroup;
	answerId: string | null;
	mode: FormMode;
	submitForm: (group: IGroup) => void,
	children: string
}

export interface IAnswerFormProps {
	answer: IAnswer;
	mode: FormMode;
	closeModal?: () => void;
	submitForm: (answer: IAnswer) => void,
	showCloseButton: boolean;
	source: number,
	children: string
}

export enum ActionTypes {
	SET_LOADING = 'SET_LOADING',
	SET_GROUP_LOADING = 'SET_GROUP_LOADING',
	SET_GROUP_ANSWERS_LOADING = 'SET_GROUP_ANSWERS_LOADING',
	SET_SUB_GROUPS = 'SET_SUB_GROUPS',
	CLEAN_SUB_TREE = 'CLEAN_SUB_TREE',
	CLEAN_TREE = 'CLEAN_TREE',
	SET_ERROR = 'SET_ERROR',
	ADD_SUB_GROUP = 'ADD_SUB_GROUP',
	SET_GROUP = 'SET_GROUP',
	SET_ADDED_GROUP = 'SET_ADDED_GROUP',
	VIEW_GROUP = 'VIEW_GROUP',
	EDIT_GROUP = 'EDIT_GROUP',
	DELETE = 'DELETE',
	RESET_GROUP_ANSWER_DONE = 'RESET_GROUP_ANSWER_DONE',

	CLOSE_GROUP_FORM = 'CLOSE_GROUP_FORM',
	CANCEL_GROUP_FORM = 'CANCEL_GROUP_FORM',
	SET_EXPANDED = 'SET_EXPANDED',
	SET_COLLAPSED = 'SET_COLLAPSED',

	GROUP_NODE_RE_LOADING = "GROUP_NODE_RE_LOADING",
	SET_GROUP_NODES_UP_THE_TREE = "SET_GROUP_NODES_UP_THE_TREE",

	// answers
	LOAD_GROUP_ANSWERS = 'LOAD_GROUP_ANSWERS',
	ADD_ANSWER = 'ADD_ANSWER',
	SET_VIEWING_EDITING_ANSWER = 'SET_VIEWING_EDITING_ANSWER',
	VIEW_ANSWER = 'VIEW_ANSWER',
	EDIT_ANSWER = 'EDIT_ANSWER',

	SET_ANSWER_SELECTED = 'SET_ANSWER_SELECTED',
	SET_ANSWER = 'SET_ANSWER',
	SET_ANSWER_AFTER_ASSIGN_ANSWER = 'SET_ANSWER_AFTER_ASSIGN_ANSWER',
	SET_ANSWER_ANSWERS = 'SET_ANSWER_ANSWERS',
	DELETE_ANSWER = 'DELETE_ANSWER',

	CLOSE_ANSWER_FORM = 'CLOSE_ANSWER_FORM',
	CANCEL_ANSWER_FORM = 'CANCEL_ANSWER_FORM'
}

export type GroupsPayload = {
	[ActionTypes.SET_LOADING]: undefined;

	[ActionTypes.SET_GROUP_LOADING]: {
		id: string;
		loading: boolean;
	}

	[ActionTypes.SET_GROUP_ANSWERS_LOADING]: {
		answerLoading: boolean;
	}

	[ActionTypes.GROUP_NODE_RE_LOADING]: undefined;

	[ActionTypes.SET_GROUP_NODES_UP_THE_TREE]: {
		groupNodesUpTheTree: IGroupKeyExtended[]; /// we could have used Id only
		groupKeyExpanded: IGroupKeyExpanded;
		fromChatBotDlg: boolean;
	};

	[ActionTypes.SET_SUB_GROUPS]: {
		subGroups: IGroup[];
	};

	[ActionTypes.ADD_SUB_GROUP]: {
		groupKey: IGroupKey,
		level: number
	}

	[ActionTypes.VIEW_GROUP]: {
		group: IGroup;
	};

	[ActionTypes.EDIT_GROUP]: {
		group: IGroup;
	};

	[ActionTypes.SET_GROUP]: {
		group: IGroup;
	};

	[ActionTypes.SET_ADDED_GROUP]: {
		group: IGroup;
	};

	[ActionTypes.DELETE]: {
		id: string;
	};

	[ActionTypes.CLEAN_SUB_TREE]: {
		groupKey: IGroupKey | null;
	};

	[ActionTypes.CLEAN_TREE]: undefined;

	[ActionTypes.CLOSE_GROUP_FORM]: undefined;

	[ActionTypes.CANCEL_GROUP_FORM]: undefined;

	[ActionTypes.SET_EXPANDED]: {
		groupKey: IGroupKey;
	}

	[ActionTypes.SET_COLLAPSED]: {
		groupKey: IGroupKey;
	}

	[ActionTypes.SET_ERROR]: {
		error: Error;
		whichRowId?: string;
	};

	[ActionTypes.RESET_GROUP_ANSWER_DONE]: undefined;


	/////////////
	// answers
	[ActionTypes.LOAD_GROUP_ANSWERS]: {
		id: string | null,
		answerRows: IAnswerRow[],
		hasMoreAnswers: boolean
	};

	[ActionTypes.ADD_ANSWER]: {
		groupInfo: IGroupInfo;
	}

	[ActionTypes.SET_VIEWING_EDITING_ANSWER]: undefined;

	[ActionTypes.VIEW_ANSWER]: {
		answer: IAnswer;
	};

	[ActionTypes.EDIT_ANSWER]: {
		answer: IAnswer;
	};

	[ActionTypes.SET_ANSWER_SELECTED]: {
		answerKey: IAnswerKey;
	};

	[ActionTypes.SET_ANSWER]: {
		answer: IAnswer
	};


	[ActionTypes.DELETE_ANSWER]: {
		answer: IAnswer
	};

	[ActionTypes.CLOSE_ANSWER_FORM]: {
		answer: IAnswer;
	};

	[ActionTypes.CANCEL_ANSWER_FORM]: {
		answer: IAnswer;
	};
};

export type GroupsActions =
	ActionMap<GroupsPayload>[keyof ActionMap<GroupsPayload>];

