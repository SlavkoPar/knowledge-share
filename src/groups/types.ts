import { link } from 'fs';
import { ActionMap, IWhoWhen, IRecord, IRecordDto, Dto2WhoWhen, WhoWhen2Dto, IWhoWhenDto } from 'global/types';

export enum FormMode {
	None = 'None',

	AddingGroup = 'AddingGroup',
	ViewingGroup = 'ViewingGroup',
	EditingGroup = 'EditingGroup',
	DeletingGroup = 'DeletingGroup',

	AddingAnswer = 'AddingAnswer',
	ViewingAnswer = 'ViewingAnswer',
	EditingAnswer = 'EditingAnswer',
	DeletingAnswer = 'DeletingAnswer',

	AddingVariation = 'AddingVariation',
	EditingVariation = 'EditingVariation',
	ViewingVariation = 'ViewingVariation'
}


/////////////////////////////////////
// Answer Related Filters

export interface IRelatedFilter {
	answerKey: IAnswerKey | null;
	filter: string;
	numOfUsages: number;
	created: IWhoWhen | null;
	lastUsed: IWhoWhen | null;
}

export interface IRelatedFilterDto {
	AnswerKey: IAnswerKey | null;
	Filter: string;
	NumOfUsages: number;
	Created: IWhoWhenDto | null;
	LastUsed: IWhoWhenDto | null;
}

export interface IRelatedFilterDtoEx {
	relatedFilterDto: IRelatedFilterDto | null;
	msg: string;
}


export class RelatedFilterDto {
	constructor(relatedFilter: IRelatedFilter) {
		const { answerKey, filter, numOfUsages, created, lastUsed } = relatedFilter;
		this.relatedFilterDto = {
			AnswerKey: answerKey,
			Filter: filter,
			Created: created ? new WhoWhen2Dto(created).whoWhenDto! : null,
			LastUsed: lastUsed ? new WhoWhen2Dto(lastUsed).whoWhenDto! : null,
			NumOfUsages: numOfUsages
		}
	}
	relatedFilterDto: IRelatedFilterDto;
}

export class RelatedFilter {
	constructor(dto: IRelatedFilterDto) {
		const { AnswerKey, Filter, Created, LastUsed, NumOfUsages } = dto;
		this.relatedFilter = {
			answerKey: AnswerKey,
			filter: Filter,
			created: Created ? new Dto2WhoWhen(Created).whoWhen! : null,
			lastUsed: LastUsed ? new Dto2WhoWhen(LastUsed).whoWhen! : null,
			numOfUsages: NumOfUsages
		}
	}
	relatedFilter: IRelatedFilter;
}

export interface IAnswerRow extends IRecord {
	partitionKey: string;
	id: string;
	title: string;
	link?: string;
	parentGroup: string | null;
	groupTitle?: string;
	isSelected?: boolean;
	rootId: string
}

export interface IAnswer extends IAnswerRow {
	source: number;
	status: number;
	groupTitle?: string;
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

export interface ILocStorage {
	lastGroupKeyExpanded: IGroupKeyExpanded | null
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

export interface IGroupRowDto extends IRecordDto {
	PartitionKey: string;
	Id: string;
	Kind: number;
	RootId?: string;
	ParentGroup: string | null;
	Title: string;
	Link: string | null;
	Header: string;
	Variations: string[];
	Level: number;
	HasSubGroups: boolean;
	GroupRowDtos: IGroupRowDto[];
	NumOfAnswers: number;
	AnswerRowDtos?: IAnswerRowDto[];
	HasMoreAnswers?: boolean;
	IsExpanded?: boolean;
}

export interface IGroupDto extends IGroupRowDto {
	Doc1: string;
}

export interface IGroupRow extends IRecord {
	partitionKey: string; // | null is a valid value so you can store data with null value in indexeddb 
	id: string;
	kind: number;
	rootId: string | null;
	parentGroup: string | null; // | null is a valid value so you can store data with null value in indexeddb 
	title: string;
	link: string | null;
	header: string;
	level: number;
	hasSubGroups: boolean;
	groupRows: IGroupRow[];
	variations: string[];
	numOfAnswers: number;
	answerRows: IAnswerRow[];
	hasMoreAnswers?: boolean;
	isExpanded?: boolean;
	titlesUpTheTree?: string;
}
export interface IGroup extends IGroupRow {
	doc1: string, // some document optionally, used in Group, but not not in GroupRow
}

// IGroup rather than IGroupRow
export const IsGroup = (obj: any): boolean => typeof obj === 'object' && obj !== null &&
	obj.hasOwnProperty('doc1') && typeof obj.doc1 === 'string';


export class GroupRowDto {
	constructor(groupRow: IGroupRow) {
		const { partitionKey, id, parentGroup, modified } = groupRow;
		this.groupRowDto = {
			PartitionKey: partitionKey,
			Id: id,
			ParentGroup: parentGroup,
			Title: '',
			Link: '',
			Header: '',
			Variations: [],
			// TODO proveri []
			HasSubGroups: false,
			GroupRowDtos: [],
			NumOfAnswers: 0,
			AnswerRowDtos: [],
			Level: 0,
			Kind: 0,
			Modified: modified ? new WhoWhen2Dto(modified).whoWhenDto! : undefined
		}
	}
	groupRowDto: IGroupRowDto;
}

export class GroupRow {
	constructor(groupRowDto: IGroupRowDto) {
		const { PartitionKey, Id, RootId, ParentGroup, Kind, Title, Link, Header, Variations, Level,
			HasSubGroups, GroupRowDtos,
			NumOfAnswers, AnswerRowDtos,
			IsExpanded } = groupRowDto;
		this.groupRow = {
			partitionKey: PartitionKey,
			id: Id,
			parentGroup: ParentGroup,
			title: Title,
			link: Link,
			header: Header,
			titlesUpTheTree: '', // traverse up the tree, until root
			variations: Variations,
			hasSubGroups: HasSubGroups!,
			groupRows: GroupRowDtos.map(dto => new GroupRow({ ...dto, RootId }).groupRow),
			numOfAnswers: NumOfAnswers,
			answerRows: AnswerRowDtos
				? AnswerRowDtos.map(dto => new AnswerRow({ ...dto, RootId: RootId ?? undefined }).answerRow)
				: [],
			level: Level,
			kind: Kind,
			isExpanded: IsExpanded,
			rootId: RootId ?? null
		}
	}
	groupRow: IGroupRow;
}

export class AnswerRow {
	constructor(rowDto: IAnswerRowDto) { //, parentGroup: string) {
		const { PartitionKey, Id, ParentGroup, Title, Link, GroupTitle, Created, Modified, Included, RootId } = rowDto;
		this.answerRow = {
			partitionKey: PartitionKey,
			id: Id,
			rootId: RootId!,
			parentGroup: ParentGroup,
			title: Title,
			link: Link,
			groupTitle: GroupTitle,
			created: new Dto2WhoWhen(Created!).whoWhen,
			modified: Modified
				? new Dto2WhoWhen(Modified).whoWhen
				: undefined,
			isSelected: Included
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
			Title: row.title,
			Link: row.link ?? '',
			GroupTitle: '',
			Created: new WhoWhen2Dto(row.created!).whoWhenDto!,
			Modified: new WhoWhen2Dto(row.modified).whoWhenDto!,
			Included: row.isSelected
		}
	}
	answerRowDto: IAnswerRowDto
}


export class GroupKey {
	constructor(cat: IGroupRow | IGroup | IGroupKeyExtended) {
		this.groupKey = cat
			? {
				partitionKey: cat.partitionKey,
				id: cat.id
			}
			: null
	}
	groupKey: IGroupKey | null;
}



export class Group {
	constructor(dto: IGroupDto) {
		const { PartitionKey, Id, Kind, RootId, ParentGroup, Title, Link, Header, Level, Variations, NumOfAnswers,
			HasSubGroups, GroupRowDtos, Created, Modified, AnswerRowDtos, IsExpanded, Doc1 } = dto;

		const subGroupRows = GroupRowDtos
			? GroupRowDtos.map((rowDto: IGroupRowDto) => new GroupRow(rowDto).groupRow)
			: [];

		const answerRows = AnswerRowDtos
			? AnswerRowDtos.map((dto: IAnswerDto) => new Answer(dto).answer)
			: [];

		this.group = {
			partitionKey: PartitionKey,
			id: Id,
			kind: Kind,
			rootId: RootId!,
			parentGroup: ParentGroup!,
			title: Title,
			link: Link,
			header: Header,
			level: Level!,
			variations: Variations ?? [],
			hasSubGroups: HasSubGroups!,
			groupRows: subGroupRows,
			created: new Dto2WhoWhen(Created!).whoWhen,
			modified: Modified
				? new Dto2WhoWhen(Modified).whoWhen
				: undefined,
			numOfAnswers: NumOfAnswers!,
			answerRows,
			isExpanded: IsExpanded === true,
			doc1: Doc1
		}
	}
	group: IGroup;
}

export class GroupDto {
	constructor(group: IGroup) {
		const { partitionKey, id, kind, parentGroup, title, link, header, level, variations, created, modified, doc1 } = group;
		this.groupDto = {
			PartitionKey: partitionKey,
			Id: id,
			Kind: kind,
			ParentGroup: parentGroup,
			Title: title,
			Link: link,
			Header: header ?? '',
			Level: level,
			HasSubGroups: true,
			GroupRowDtos: [],
			NumOfAnswers: 0,
			AnswerRowDtos: [],
			Variations: variations,
			Created: new WhoWhen2Dto(created).whoWhenDto!,
			Modified: new WhoWhen2Dto(modified).whoWhenDto!,
			Doc1: doc1
		}
	}
	groupDto: IGroupDto;
}

export class Answer {
	constructor(dto: IAnswerDto) { //, parentGroup: string) {
		// TODO possible to call base class construtor
		this.answer = {
			rootId: '', // TODO will be set later
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
	constructor(answer: IAnswerRow | IAnswer | undefined) {
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
		const { partitionKey, id, parentGroup, title, link, source, status, created, modified } = answer;
		this.answerDto = {
			PartitionKey: partitionKey,
			Id: id,
			ParentGroup: parentGroup ?? 'null',  // TODO proveri
			Title: title,
			Link: link ?? '',
			Source: source,
			Status: status,
			Created: new WhoWhen2Dto(created).whoWhenDto!,
			Modified: new WhoWhen2Dto(modified).whoWhenDto!
		}
	}
	answerDto: IAnswerDto;
}

export interface IAnswerRowDto extends IRecordDto {
	PartitionKey: string;
	Id: string;
	RootId?: string,
	ParentGroup: string;
	Title: string;
	Link: string;
	GroupTitle?: string;
	Included?: boolean;
	Source?: number;
	Status?: number;
}

export interface IAnswerDto extends IAnswerRowDto {
	oldParentGroup?: string;
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



export interface IGroupDtoEx {
	groupDto: IGroupDto | null;
	msg: string;
}

export interface IGroupRowDtoEx {
	groupRowDto: IGroupRowDto | null;
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

export interface IExpandInfo {
	rootId: string;
	groupKey: IGroupKey;
	formMode: FormMode;
	includeAnswerId?: string;
	newGroupRow?: IGroupRow;
	newAnswer?: IAnswerRow;
}

export interface IParentInfo {
	//execute?: (method: string, endpoint: string) => Promise<any>,
	// partitionKey: string | null,
	// parentGroup: string | null,
	//groupKey: IGroupKey,
	groupRow: IGroupRow,
	startCursor?: number,
	includeAnswerId?: string | null
	level?: number,
	title?: string, // to easier follow getting the list of sub-groups
	inAdding?: boolean,
	isExpanded?: boolean
	//subGroups?: IGroup[]
}

export interface IGroupsState {
	formMode: FormMode;
	topRows: IGroupRow[];
	topRowsLoading: boolean;
	topRowsLoaded: boolean;
	keyExpanded: IGroupKeyExpanded | null;
	groupId_answerId_done?: string;
	nodeOpening: boolean;
	nodeOpened: boolean;
	activeGroup: IGroup | null;
	activeAnswer: IAnswer | null;
	loading: boolean;
	answerLoading: boolean,
	error?: Error;
	whichRowId?: string; // group.id or answer.id
}

export interface ILocStorage {
	lastGroupKeyExpanded: IGroupKeyExpanded | null;
}

export interface ILoadGroupAnswers {
	groupKey: IGroupKey,
	startCursor: number,
	includeAnswerId: string | null
}

export interface IGroupsContext {
	state: IGroupsState,
	openGroupNode: (keyExpanded: IGroupKeyExpanded, fromChatBotDlg?: string) => Promise<any>;
	loadTopGroupRows: () => Promise<any>,
	addSubGroup: (groupRow: IGroupRow) => Promise<any>;
	cancelAddGroup: () => Promise<any>;
	createGroup: (group: IGroup) => void,
	viewGroup: (groupRow: IGroupRow, includeAnswerId: string) => void,
	editGroup: (groupRow: IGroupRow, includeAnswerId: string) => void,
	updateGroup: (group: IGroup, closeForm: boolean) => void,
	deleteGroup: (groupRow: IGroupRow) => void,
	deleteGroupVariation: (groupKey: IGroupKey, name: string) => void,
	expandGroup: (expandInfo: IExpandInfo) => Promise<any>,
	collapseGroup: (groupRow: IGroupRow) => void,
	//////////////
	// answers
	loadGroupAnswers: (catParams: ILoadGroupAnswers) => void;  //(parentInfo: IParentInfo) => void,
	addAnswer: (groupKey: IGroupKey, rootId: string) => Promise<any>;
	cancelAddAnswer: () => Promise<any>;
	createAnswer: (answer: IAnswer, fromModal: boolean) => Promise<any>;
	viewAnswer: (answerRow: IAnswerRow) => void;
	editAnswer: (answerRow: IAnswerRow) => void;
	updateAnswer: (rootId: string, oldParentGroup: string, answer: IAnswer, groupChanged: boolean) => Promise<any>;
	deleteAnswer: (answerRow: IAnswerRow) => void;
}

export interface IGroupFormProps {
	inLine: boolean;
	group: IGroup;
	answerId: string | null;
	formMode: FormMode;
	submitForm: (group: IGroup) => void,
	children: string
}

export interface IAnswerFormProps {
	answer: IAnswer;
	closeModal?: () => void;
	submitForm: (answer: IAnswer) => void,
	showCloseButton: boolean;
	source: number,
	children: string
}

/////////////////////////////////////////////////
// 
export enum ActionTypes {
	SET_TOP_ROWS = 'SET_TOP_ROWS',
	SET_NODE_OPENED = "SET_NODE_OPENED",
	SET_LOADING = 'SET_LOADING',
	SET_TOP_ROWS_LOADING = 'SET_TOP_ROWS_LOADING',
	SET_GROUP_ANSWERS_LOADING = 'SET_GROUP_ANSWERS_LOADING',
	SET_SUB_GROUPS = 'SET_SUB_GROUPS',
	SET_ERROR = 'SET_ERROR',
	ADD_SUB_GROUP = 'ADD_SUB_GROUP',
	GROUP_TITLE_CHANGED = 'GROUP_TITLE_CHANGED',
	CANCEL_ADD_SUB_GROUP = 'CANCEL_ADD_SUB_GROUP',
	SET_GROUP = 'SET_GROUP',
	SET_GROUP_ROW = 'SET_GROUP_ROW',
	SET_GROUP_ROW_EXPANDED = 'SET_GROUP_ROW_EXPANDED',
	SET_GROUP_ROW_COLLAPSED = 'SET_GROUP_ROW_COLLAPSED',
	SET_GROUP_ADDED = 'SET_GROUP_ADDED',
	SET_GROUP_TO_VIEW = 'SET_GROUP_TO_VIEW',
	SET_GROUP_TO_EDIT = 'SET_GROUP_TO_EDIT',
	SET_GROUP_UPDATED = 'SET_GROUP_UPDATED',
	DELETE_GROUP = 'DELETE_GROUP',
	RESET_GROUP_ANSWER_DONE = 'RESET_GROUP_ANSWER_DONE',

	CLOSE_GROUP_FORM = 'CLOSE_GROUP_FORM',
	CANCEL_GROUP_FORM = 'CANCEL_GROUP_FORM',

	GROUP_NODE_OPENING = "GROUP_NODE_OPENING",
	FORCE_OPEN_GROUP_NODE = "FORCE_OPEN_GROUP_NODE",

	// answers
	LOAD_GROUP_ANSWERS = 'LOAD_GROUP_ANSWERS',
	ADD_ANSWER = 'ADD_ANSWER',
	ANSWER_TITLE_CHANGED = 'ANSWER_TITLE_CHANGED',

	CANCEL_ADD_ANSWER = 'CANCEL_ADD_ANSWER',
	SET_ANSWER_TO_VIEW = 'SET_ANSWER_TO_VIEW',
	SET_ANSWER_TO_EDIT = 'SET_ANSWER_TO_EDIT',

	SET_ANSWER_SELECTED = 'SET_ANSWER_SELECTED',
	SET_ANSWER = 'SET_ANSWER',
	SET_ANSWER_AFTER_ASSIGN_ANSWER = 'SET_ANSWER_AFTER_ASSIGN_ANSWER',
	SET_ANSWER_ANSWERS = 'SET_ANSWER_ANSWERS',
	DELETE_ANSWER = 'DELETE_ANSWER',

	CLOSE_ANSWER_FORM = 'CLOSE_ANSWER_FORM',
	CANCEL_ANSWER_FORM = 'CANCEL_ANSWER_FORM'
}

/*
//export const actionsThatModifyFirstLevelGroupRow = [
export const actionsThatModifyTreeView = [
	// ActionTypes.SET_FIRST_LEVEL_GROUP_ROWS keep commented
	// ActionTypes.SET_GROUP_NODE_OPENED,
	ActionTypes.DELETE_GROUP,
	ActionTypes.SET_GROUP_ROW_EXPANDED,
	ActionTypes.SET_GROUP_ROW_COLLAPSED,
	ActionTypes.SET_GROUP_UPDATED,
	//ActionTypes.SET_GROUP_TO_VIEW,
	//ActionTypes.SET_GROUP_TO_EDIT,
	// ActionTypes.SET_ANSWER_TO_VIEW,
	// ActionTypes.SET_ANSWER_TO_EDIT,
	ActionTypes.CLOSE_GROUP_FORM,
	ActionTypes.CANCEL_GROUP_FORM,
	ActionTypes.ADD_ANSWER
]
	*/

export const actionTypesStoringToLocalStorage = [
	// ActionTypes.SET_GROUP_NODE_OPENED
	ActionTypes.SET_GROUP_ROW_EXPANDED,
	ActionTypes.SET_GROUP_ROW_COLLAPSED,
	ActionTypes.SET_GROUP_TO_VIEW,
	ActionTypes.SET_GROUP_TO_EDIT,
	ActionTypes.SET_ANSWER_TO_VIEW,
	ActionTypes.SET_ANSWER_TO_EDIT,
	ActionTypes.FORCE_OPEN_GROUP_NODE
];


export type GroupsPayload = {


	[ActionTypes.SET_TOP_ROWS_LOADING]: {
		groupRow?: IGroupRow;
	}

	[ActionTypes.SET_LOADING]: {
		groupRow?: IGroupRow;
	}


	[ActionTypes.SET_GROUP_ANSWERS_LOADING]: {
		groupRow?: IGroupRow;
		answerLoading: boolean;
	}

	[ActionTypes.GROUP_NODE_OPENING]: {
		groupRow?: IGroupRow;
		//keyExpanded: IGroupKeyExpanded
	};

	[ActionTypes.SET_NODE_OPENED]: {
		// groupNodesUpTheTree: IGroupKeyExtended[]; /// we could have used Id only
		groupRow: IGroupRow;
		keyExpanded: IGroupKeyExpanded;
		answerId: string | null,
		fromChatBotDlg: boolean;
	};


	[ActionTypes.SET_TOP_ROWS]: {
		groupRow?: IGroupRow;
		topGroupRows: IGroupRow[];
	};

	[ActionTypes.SET_SUB_GROUPS]: {
		groupRow?: IGroupRow;
		id: string | null;
		groupRows: IGroupRow[];
	};

	[ActionTypes.ADD_SUB_GROUP]: {
		groupRow?: IGroupRow;
		rootId: string,
		groupKey: IGroupKey,
		level: number
	}

	[ActionTypes.GROUP_TITLE_CHANGED]: {
		groupRow?: IGroupRow;
		id: string;
		value: string;
	}

	[ActionTypes.ANSWER_TITLE_CHANGED]: {
		groupRow?: IGroupRow;
		groupId: string;
		id: string;
		value: string;
	}



	[ActionTypes.CANCEL_ADD_SUB_GROUP]: {
		groupRow?: IGroupRow;
	}


	[ActionTypes.SET_GROUP]: {
		groupRow: IGroup;
	};


	[ActionTypes.SET_GROUP_TO_VIEW]: {
		groupRow: IGroupRow; // IGroup extends IGroupRow
	};

	[ActionTypes.SET_GROUP_TO_EDIT]: {
		groupRow: IGroupRow; // IGroup extends IGroupRow
	};

	[ActionTypes.SET_GROUP_UPDATED]: {
		groupRow: IGroupRow; // IGroup extends IGroupRow
	};


	[ActionTypes.SET_GROUP_ROW_EXPANDED]: {
		groupRow: IGroupRow;
		formMode: FormMode;
	};

	[ActionTypes.SET_GROUP_ROW_COLLAPSED]: {
		groupRow: IGroupRow;
	};

	[ActionTypes.SET_GROUP_ADDED]: {
		groupRow?: IGroupRow;
		//group: IGroup;
	};

	[ActionTypes.DELETE_GROUP]: {
		groupRow?: IGroupRow;
		id: string;
	};


	[ActionTypes.CLOSE_GROUP_FORM]: {
		groupRow?: IGroupRow;
	};

	[ActionTypes.CANCEL_GROUP_FORM]: {
		groupRow?: IGroupRow;
	};


	[ActionTypes.SET_ERROR]: {
		groupRow?: IGroupRow;
		error: Error;
		whichRowId?: string;
	};

	[ActionTypes.RESET_GROUP_ANSWER_DONE]: {
		groupRow?: IGroupRow
	};

	[ActionTypes.FORCE_OPEN_GROUP_NODE]: {
		groupRow?: IGroupRow,
		keyExpanded: IGroupKeyExpanded
	};



	/////////////
	// answers
	[ActionTypes.LOAD_GROUP_ANSWERS]: {
		groupRow: IGroupRow
	};

	[ActionTypes.ADD_ANSWER]: {
		groupRow?: IGroupRow;
		groupInfo: IGroupInfo;
	}

	[ActionTypes.CANCEL_ADD_ANSWER]: {
		groupRow?: IGroupRow;
	}


	[ActionTypes.SET_ANSWER_TO_VIEW]: {
		groupRow?: IGroupRow;
		answer: IAnswer;
	};

	[ActionTypes.SET_ANSWER_TO_EDIT]: {
		groupRow?: IGroupRow;
		answer: IAnswer;
	};

	[ActionTypes.SET_ANSWER_SELECTED]: {
		groupRow?: IGroupRow;
		answerKey: IAnswerKey;
	};

	[ActionTypes.SET_ANSWER]: {
		groupRow?: IGroupRow;
		formMode: FormMode;
		answer: IAnswer;
	};

	[ActionTypes.SET_ANSWER_AFTER_ASSIGN_ANSWER]: {
		groupRow?: IGroupRow;
		answer: IAnswer
	};



	[ActionTypes.DELETE_ANSWER]: {
		groupRow?: IGroupRow;
		answer: IAnswer
	};

	[ActionTypes.CLOSE_ANSWER_FORM]: {
		groupRow?: IGroupRow;
		answer: IAnswer;
	};

	[ActionTypes.CANCEL_ANSWER_FORM]: {
		groupRow?: IGroupRow;
		answer: IAnswer;
	};
};

export type GroupsActions =
	ActionMap<GroupsPayload>[keyof ActionMap<GroupsPayload>];

