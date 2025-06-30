import { ActionMap, IWhoWhen, IRecord, IRecordDto, Dto2WhoWhen, WhoWhen2Dto, IWhoWhenDto } from 'global/types';
import { IAnswerKey } from 'groups/types';

export enum FormMode {
	None = 'None',

	AddingCategory = 'AddingCategory',
	ViewingCategory = 'ViewingCategory',
	EditingCategory = 'EditingCategory',
	DeletingCategory = 'DeletingCategory',

	AddingQuestion = 'AddingQuestion',
	ViewingQuestion = 'ViewingQuestion',
	EditingQuestion = 'EditingQuestion',
	DeletingQuestion = 'DeletingQuestion',

	AddingVariation = 'AddingVariation',
	EditingVariation = 'EditingVariation',
	ViewingVariation = 'ViewingVariation'
}

export interface IFromUserAssignedAnswer {
	id: string,
	createdBy: string
}

/////////////////////////////////////
// Question Related Filters

export interface IRelatedFilter {
	questionKey: IQuestionKey | null;
	filter: string;
	numOfUsages: number;
	created: IWhoWhen | null;
	lastUsed: IWhoWhen | null;
}

export interface IRelatedFilterDto {
	QuestionKey: IQuestionKey | null;
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
		const { questionKey, filter, numOfUsages, created, lastUsed } = relatedFilter;
		this.relatedFilterDto = {
			QuestionKey: questionKey,
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
		const { QuestionKey, Filter, Created, LastUsed, NumOfUsages } = dto;
		this.relatedFilter = {
			questionKey: QuestionKey,
			filter: Filter,
			created: Created ? new Dto2WhoWhen(Created).whoWhen! : null,
			lastUsed: LastUsed ? new Dto2WhoWhen(LastUsed).whoWhen! : null,
			numOfUsages: NumOfUsages
		}
	}
	relatedFilter: IRelatedFilter;
}

export interface IQuestionRow extends IRecord {
	partitionKey: string;
	id: string;
	title: string;
	numOfAssignedAnswers: number;
	parentCategory: string | null;
	categoryTitle?: string;
	isSelected?: boolean;
	rootId: string
}

export interface IQuestion extends IQuestionRow {
	assignedAnswers: IAssignedAnswer[];
	relatedFilters: IRelatedFilter[]
	numOfRelatedFilters: number,
	source: number;
	status: number;
	fromUserAssignedAnswer?: IFromUserAssignedAnswer[];
	categoryTitle?: string;
}

export interface ICategoryKey {
	partitionKey: string | null;
	id: string | null;
}

export interface ICategoryKeyExpanded { //extends ICategoryKey {
	partitionKey: string | null;
	id: string | null;
	questionId: string | null;
}

export interface ILocStorage {
	lastCategoryKeyExpanded: ICategoryKeyExpanded | null
}


export interface ICategoryKeyExtended extends ICategoryKey {
	title: string;
}


export interface IQuestionKey {
	parentCategory?: string;
	partitionKey: string | null;   // ona day we are going to enable question
	id: string;
}


export interface IVariation {
	name: string;
}

export interface ICategoryRowDto extends IRecordDto {
	PartitionKey: string;
	Id: string;
	Kind: number;
	RootId?: string;
	ParentCategory: string | null;
	Title: string;
	Link: string | null;
	Header: string;
	Variations: string[];
	Level: number;
	HasSubCategories: boolean;
	SubCategoryRowDtos: ICategoryRowDto[];
	NumOfQuestions: number;
	QuestionRowDtos?: IQuestionRowDto[];
	HasMoreQuestions?: boolean;
	IsExpanded?: boolean;
}

export interface ICategoryDto extends ICategoryRowDto {
	Doc1: string;
}

export interface ICategoryRow extends IRecord {
	partitionKey: string; // | null is a valid value so you can store data with null value in indexeddb 
	id: string;
	kind: number;
	rootId: string | null;
	parentCategory: string | null; // | null is a valid value so you can store data with null value in indexeddb 
	title: string;
	link: string | null;
	header: string;
	level: number;
	hasSubCategories: boolean;
	categoryRows: ICategoryRow[];
	variations: string[];
	numOfQuestions: number;
	questionRows: IQuestionRow[];
	hasMoreQuestions?: boolean;
	isExpanded?: boolean;
	titlesUpTheTree?: string;
}
export interface ICategory extends ICategoryRow {
	doc1: string, // some document optionally, used in Category, but not not in CategoryRow
}

// ICategory rather than ICategoryRow
export const IsCategory = (obj: any): boolean => typeof obj === 'object' && obj !== null &&
	obj.hasOwnProperty('doc1') && typeof obj.doc1 === 'string';


export class CategoryRowDto {
	constructor(categoryRow: ICategoryRow) {
		const { partitionKey, id, parentCategory, modified } = categoryRow;
		this.categoryRowDto = {
			PartitionKey: partitionKey,
			Id: id,
			ParentCategory: parentCategory,
			Title: '',
			Link: '',
			Header: '',
			Variations: [],
			// TODO proveri []
			HasSubCategories: false,
			SubCategoryRowDtos: [],
			NumOfQuestions: 0,
			QuestionRowDtos: [],
			Level: 0,
			Kind: 0,
			Modified: modified ? new WhoWhen2Dto(modified).whoWhenDto! : undefined
		}
	}
	categoryRowDto: ICategoryRowDto;
}

export class CategoryRow {
	constructor(categoryRowDto: ICategoryRowDto) {
		const { PartitionKey, Id, RootId, ParentCategory, Kind, Title, Link, Header, Variations, Level,
			HasSubCategories, SubCategoryRowDtos,
			NumOfQuestions, QuestionRowDtos,
			IsExpanded } = categoryRowDto;
		this.categoryRow = {
			partitionKey: PartitionKey,
			id: Id,
			parentCategory: ParentCategory,
			title: Title,
			link: Link,
			header: Header,
			titlesUpTheTree: '', // traverse up the tree, until root
			variations: Variations,
			hasSubCategories: HasSubCategories!,
			categoryRows: SubCategoryRowDtos.map(dto => new CategoryRow({ ...dto, RootId }).categoryRow),
			numOfQuestions: NumOfQuestions,
			questionRows: QuestionRowDtos
				? QuestionRowDtos.map(dto => new QuestionRow({ ...dto, RootId: RootId ?? undefined }).questionRow)
				: [],
			level: Level,
			kind: Kind,
			isExpanded: IsExpanded,
			rootId: RootId ?? null
		}
	}
	categoryRow: ICategoryRow;
}

export class QuestionRow {
	constructor(rowDto: IQuestionRowDto) { //, parentCategory: string) {
		const { PartitionKey, Id, ParentCategory, NumOfAssignedAnswers, Title, CategoryTitle, Created, Modified, Included, RootId } = rowDto;
		this.questionRow = {
			partitionKey: PartitionKey,
			id: Id,
			rootId: RootId!,
			parentCategory: ParentCategory,
			numOfAssignedAnswers: NumOfAssignedAnswers ?? 0,
			title: Title,
			categoryTitle: CategoryTitle,
			created: new Dto2WhoWhen(Created!).whoWhen,
			modified: Modified
				? new Dto2WhoWhen(Modified).whoWhen
				: undefined,
			isSelected: Included
		}
	}
	questionRow: IQuestionRow
}

export class QuestionRowDto {
	constructor(row: IQuestionRow) { //, parentCategory: string) {
		this.questionRowDto = {
			PartitionKey: row.partitionKey,
			Id: row.id,
			ParentCategory: row.parentCategory ?? '',
			NumOfAssignedAnswers: row.numOfAssignedAnswers ?? 0,
			Title: '',
			CategoryTitle: '',
			Created: new WhoWhen2Dto(row.created!).whoWhenDto!,
			Modified: new WhoWhen2Dto(row.modified).whoWhenDto!,
			Included: row.isSelected
		}
	}
	questionRowDto: IQuestionRowDto
}


export class CategoryKey {
	constructor(cat: ICategoryRow | ICategory | ICategoryKeyExtended) {
		this.categoryKey = cat
			? {
				partitionKey: cat.partitionKey,
				id: cat.id
			}
			: null
	}
	categoryKey: ICategoryKey | null;
}



export class Category {
	constructor(dto: ICategoryDto) {
		const { PartitionKey, Id, Kind, RootId, ParentCategory, Title, Link, Header, Level, Variations, NumOfQuestions,
			HasSubCategories, SubCategoryRowDtos, Created, Modified, QuestionRowDtos, IsExpanded, Doc1 } = dto;

		const categoryRows = SubCategoryRowDtos
			? SubCategoryRowDtos.map((rowDto: ICategoryRowDto) => new CategoryRow(rowDto).categoryRow)
			: [];

		const questionRows = QuestionRowDtos
			? QuestionRowDtos.map((dto: IQuestionDto) => new Question(dto).question)
			: [];

		this.category = {
			partitionKey: PartitionKey,
			id: Id,
			kind: Kind,
			rootId: RootId!,
			parentCategory: ParentCategory!,
			title: Title,
			link: Link,
			header: Header,
			level: Level!,
			variations: Variations ?? [],
			hasSubCategories: HasSubCategories!,
			categoryRows,
			created: new Dto2WhoWhen(Created!).whoWhen,
			modified: Modified
				? new Dto2WhoWhen(Modified).whoWhen
				: undefined,
			numOfQuestions: NumOfQuestions!,
			questionRows,
			isExpanded: IsExpanded === true,
			doc1: Doc1
		}
	}
	category: ICategory;
}

export class CategoryDto {
	constructor(category: ICategory) {
		const { partitionKey, id, kind, parentCategory, title, link, header, level, variations, created, modified, doc1 } = category;
		this.categoryDto = {
			PartitionKey: partitionKey,
			Id: id,
			Kind: kind,
			ParentCategory: parentCategory,
			Title: title,
			Link: link,
			Header: header ?? '',
			Level: level,
			HasSubCategories: true,
			SubCategoryRowDtos: [],
			NumOfQuestions: 0,
			QuestionRowDtos: [],
			Variations: variations,
			Created: new WhoWhen2Dto(created).whoWhenDto!,
			Modified: new WhoWhen2Dto(modified).whoWhenDto!,
			Doc1: doc1
		}
	}
	categoryDto: ICategoryDto;
}

export class Question {
	constructor(dto: IQuestionDto) { //, parentCategory: string) {
		const assignedAnswers = dto.AssignedAnswerDtos ?
			dto.AssignedAnswerDtos.map((dto: IAssignedAnswerDto) => new AssignedAnswer(dto).assignedAnswer)
			: [];
		const relatedFilters = dto.RelatedFilterDtos
			? dto.RelatedFilterDtos.map((Dto: IRelatedFilterDto) => new RelatedFilter(Dto).relatedFilter)
			: [];
		// TODO possible to call base class construtor
		this.question = {
			rootId: '', // TODO will be set later
			parentCategory: dto.ParentCategory,
			partitionKey: dto.PartitionKey,
			id: dto.Id,
			title: dto.Title,
			categoryTitle: dto.CategoryTitle,
			assignedAnswers,
			numOfAssignedAnswers: dto.NumOfAssignedAnswers ?? 0,
			relatedFilters,
			numOfRelatedFilters: dto.NumOfRelatedFilters ?? 0,
			source: dto.Source ?? 0,
			status: dto.Status ?? 0,
			isSelected: dto.Included !== undefined,
			created: new Dto2WhoWhen(dto.Created!).whoWhen,
			modified: dto.Modified
				? new Dto2WhoWhen(dto.Modified).whoWhen
				: undefined
		}
	}
	question: IQuestion
}

export class QuestionKey {
	constructor(question: IQuestionRow | IQuestion | undefined) {
		this.questionKey = question
			? {
				partitionKey: question.partitionKey,
				id: question.id,
				parentCategory: question.parentCategory ?? undefined
			}
			: null
	}
	questionKey: IQuestionKey | null;
}

export class QuestionDto {
	constructor(question: IQuestion) {
		const { partitionKey, id, parentCategory, title, source, status, created, modified,
			numOfAssignedAnswers, numOfRelatedFilters } = question;
		this.questionDto = {
			PartitionKey: partitionKey,
			Id: id,
			ParentCategory: parentCategory ?? 'null',  // TODO proveri
			Title: title,
			//AssignedAnswerDtos: question.assignedAnswers.map((a: IAssignedAnswer) => new AssignedAnswerDto(a).assignedAnswerDto),
			NumOfAssignedAnswers: numOfAssignedAnswers,
			//RelatedFilterDtos: question.relatedFilters.map((a: IRelatedFilter) => new RelatedFilterDto(a).relatedFilterDto),
			NumOfRelatedFilters: numOfRelatedFilters,
			Source: source,
			Status: status,
			Created: new WhoWhen2Dto(created).whoWhenDto!,
			Modified: new WhoWhen2Dto(modified).whoWhenDto!
		}
	}
	questionDto: IQuestionDto;
}

export interface IQuestionRowDto extends IRecordDto {
	PartitionKey: string;
	Id: string;
	RootId?: string,
	ParentCategory: string;
	NumOfAssignedAnswers?: number,
	Title: string;
	CategoryTitle?: string;
	Included?: boolean;
	Source?: number;
	Status?: number;
}

export interface IQuestionDto extends IQuestionRowDto {
	AssignedAnswerDtos?: IAssignedAnswerDto[];
	RelatedFilterDtos?: IRelatedFilterDto[]
	NumOfRelatedFilters?: number;
	oldParentCategory?: string;
}

export interface IQuestionDtoEx {
	questionDto: IQuestionDto | null;
	msg: string;
}

export interface IQuestionEx {
	question: IQuestion | null;
	msg: string;
}


export interface IQuestionsMore {
	questions: IQuestionDto[];
	hasMoreQuestions: boolean;
}



export interface ICategoryDtoEx {
	categoryDto: ICategoryDto | null;
	msg: string;
}

export interface ICategoryRowDtoEx {
	categoryRowDto: ICategoryRowDto | null;
	msg: string;
}


export interface ICategoryDtoListEx {
	categoryDtoList: ICategoryDto[];
	msg: string;
}


export interface ICategoryInfo {
	categoryKey: ICategoryKey;
	level: number
}

export interface IExpandInfo {
	rootId: string;
	categoryKey: ICategoryKey;
	formMode: FormMode;
	includeQuestionId?: string;
	newCategoryRow?: ICategoryRow;
	newQuestion?: IQuestionRow;
}


export interface IParentInfo {
	//execute?: (method: string, endpoint: string) => Promise<any>,
	// partitionKey: string | null,
	// parentCategory: string | null,
	//categoryKey: ICategoryKey,
	categoryRow: ICategoryRow,
	startCursor?: number,
	includeQuestionId?: string | null
	level?: number,
	title?: string, // to easier follow getting the list of sub-categories
	inAdding?: boolean,
	isExpanded?: boolean
	//subCategories?: ICategory[]
}

export interface ICategoriesState {
	formMode: FormMode;
	topCategoryRows: ICategoryRow[];
	topCategoryRowsLoading: boolean;
	topCategoryRowsLoaded: boolean;
	categoryKeyExpanded: ICategoryKeyExpanded | null;
	categoryId_questionId_done?: string;
	categoryNodeOpening: boolean;
	categoryNodeOpened: boolean;
	activeCategory: ICategory | null;
	activeQuestion: IQuestion | null;
	loading: boolean;
	questionLoading: boolean,
	error?: Error;
	whichRowId?: string; // category.id or question.id
}

export interface ILocStorage {
	lastCategoryKeyExpanded: ICategoryKeyExpanded | null;
}

export interface ILoadCategoryQuestions {
	categoryKey: ICategoryKey,
	startCursor: number,
	includeQuestionId: string | null
}

export interface ICategoriesContext {
	state: ICategoriesState,
	openCategoryNode: (categoryKeyExpanded: ICategoryKeyExpanded, fromChatBotDlg?: string) => Promise<any>;
	loadTopCategoryRows: () => Promise<any>,
	addSubCategory: (categoryRow: ICategoryRow) => Promise<any>;
	cancelAddCategory: () => Promise<any>;
	createCategory: (category: ICategory) => void,
	viewCategory: (categoryRow: ICategoryRow, includeQuestionId: string) => void,
	editCategory: (categoryRow: ICategoryRow, includeQuestionId: string) => void,
	updateCategory: (category: ICategory, closeForm: boolean) => void,
	deleteCategory: (categoryRow: ICategoryRow) => void,
	deleteCategoryVariation: (categoryKey: ICategoryKey, name: string) => void,
	expandCategory: (expandInfo: IExpandInfo) => Promise<any>,
	collapseCategory: (categoryRow: ICategoryRow) => void,
	//////////////
	// questions
	loadCategoryQuestions: (catParams: ILoadCategoryQuestions) => void;  //(parentInfo: IParentInfo) => void,
	addQuestion: (categoryKey: ICategoryKey, rootId: string) => Promise<any>;
	cancelAddQuestion: () => Promise<any>;
	createQuestion: (question: IQuestion, fromModal: boolean) => Promise<any>;
	viewQuestion: (questionRow: IQuestionRow) => void;
	editQuestion: (questionRow: IQuestionRow) => void;
	updateQuestion: (rootId: string, oldParentCategory: string, question: IQuestion, categoryChanged: boolean) => Promise<any>;
	assignQuestionAnswer: (action: 'Assign' | 'UnAssign', questionKey: IQuestionKey, answerKey: IAnswerKey, assigned: IWhoWhen) => Promise<any>;
	deleteQuestion: (questionRow: IQuestionRow) => void;
}

export interface ICategoryFormProps {
	inLine: boolean;
	category: ICategory;
	questionId: string | null;
	formMode: FormMode;
	submitForm: (category: ICategory) => void,
	children: string
}

export interface IQuestionFormProps {
	question: IQuestion;
	closeModal?: () => void;
	submitForm: (question: IQuestion) => void,
	showCloseButton: boolean;
	source: number,
	children: string
}


/////////////////////////////////////////////////
// Assigned Answers

export interface IAssignedAnswer {
	questionKey: IQuestionKey;
	answerKey: IAnswerKey;
	answerTitle: string;
	answerLink: string;
	created: IWhoWhen,
	modified: IWhoWhen | null
}

export interface IAssignedAnswerDto {
	QuestionKey: IQuestionKey;
	AnswerKey: IAnswerKey;
	AnswerTitle: string;
	AnswerLink: string;
	Created: IWhoWhenDto;
	Modified: IWhoWhenDto | null;
}

export interface IAssignedAnswerDtoEx {
	assignedAnswerDto: IAssignedAnswerDto | null;
	msg: string;
}

export class AssignedAnswerDto {
	constructor(assignedAnswer: IAssignedAnswer) {
		const { questionKey, answerKey, answerTitle, answerLink, created, modified } = assignedAnswer;
		this.assignedAnswerDto = {
			QuestionKey: questionKey,
			AnswerKey: answerKey,
			AnswerTitle: answerTitle ?? '',
			AnswerLink: answerTitle ?? '',
			Created: new WhoWhen2Dto(created).whoWhenDto!,
			Modified: modified ? new WhoWhen2Dto(modified).whoWhenDto! : null
		}
	}
	assignedAnswerDto: IAssignedAnswerDto;
}

export class AssignedAnswer {
	constructor(dto: IAssignedAnswerDto) {
		const { QuestionKey, AnswerKey, AnswerTitle, AnswerLink, Created, Modified } = dto;
		this.assignedAnswer = {
			questionKey: QuestionKey,
			answerKey: AnswerKey,
			answerTitle: AnswerTitle,
			answerLink: AnswerLink,
			created: new Dto2WhoWhen(Created).whoWhen!,
			modified: Modified ? new Dto2WhoWhen(Modified).whoWhen! : null
		}
	}
	assignedAnswer: IAssignedAnswer;
}


export enum ActionTypes {
	SET_TOP_CATEGORY_ROWS = 'SET_TOP_CATEGORY_ROWS',
	SET_CATEGORY_NODE_OPENED = "SET_CATEGORY_NODE_OPENED",
	SET_LOADING = 'SET_LOADING',
	SET_TOP_CATEGORY_ROWS_LOADING = 'SET_TOP_CATEGORY_ROWS_LOADING',
	SET_CATEGORY_LOADING = 'SET_CATEGORY_LOADING',
	SET_CATEGORY_QUESTIONS_LOADING = 'SET_CATEGORY_QUESTIONS_LOADING',
	SET_SUB_CATEGORIES = 'SET_SUB_CATEGORIES',
	SET_ERROR = 'SET_ERROR',
	ADD_SUB_CATEGORY = 'ADD_SUB_CATEGORY',
	CATEGORY_TITLE_CHANGED = 'CATEGORY_TITLE_CHANGED',
	CANCEL_ADD_SUB_CATEGORY = 'CANCEL_ADD_SUB_CATEGORY',
	SET_CATEGORY = 'SET_CATEGORY',
	SET_CATEGORY_ROW = 'SET_CATEGORY_ROW',
	SET_CATEGORY_ROW_EXPANDED = 'SET_CATEGORY_ROW_EXPANDED',
	SET_CATEGORY_ROW_COLLAPSED = 'SET_CATEGORY_ROW_COLLAPSED',
	SET_CATEGORY_ADDED = 'SET_CATEGORY_ADDED',
	SET_CATEGORY_TO_VIEW = 'SET_CATEGORY_TO_VIEW',
	SET_CATEGORY_TO_EDIT = 'SET_CATEGORY_TO_EDIT',
	SET_CATEGORY_UPDATED = 'SET_CATEGORY_UPDATED',
	DELETE_CATEGORY = 'DELETE_CATEGORY',
	RESET_CATEGORY_QUESTION_DONE = 'RESET_CATEGORY_QUESTION_DONE',

	CLOSE_CATEGORY_FORM = 'CLOSE_CATEGORY_FORM',
	CANCEL_CATEGORY_FORM = 'CANCEL_CATEGORY_FORM',

	CATEGORY_NODE_OPENING = "CATEGORY_NODE_OPENING",
	FORCE_OPEN_CATEGORY_NODE = "FORCE_OPEN_CATEGORY_NODE",

	// questions
	LOAD_CATEGORY_QUESTIONS = 'LOAD_CATEGORY_QUESTIONS',
	ADD_QUESTION = 'ADD_QUESTION',
	QUESTION_TITLE_CHANGED = 'QUESTION_TITLE_CHANGED',

	CANCEL_ADD_QUESTION = 'CANCEL_ADD_QUESTION',
	SET_QUESTION_TO_VIEW = 'SET_QUESTION_TO_VIEW',
	SET_QUESTION_TO_EDIT = 'SET_QUESTION_TO_EDIT',

	SET_QUESTION_SELECTED = 'SET_QUESTION_SELECTED',
	SET_QUESTION = 'SET_QUESTION',
	SET_QUESTION_AFTER_ASSIGN_ANSWER = 'SET_QUESTION_AFTER_ASSIGN_ANSWER',
	SET_QUESTION_ANSWERS = 'SET_QUESTION_ANSWERS',
	DELETE_QUESTION = 'DELETE_QUESTION',

	CLOSE_QUESTION_FORM = 'CLOSE_QUESTION_FORM',
	CANCEL_QUESTION_FORM = 'CANCEL_QUESTION_FORM'
}

/*
//export const actionsThatModifyFirstLevelCategoryRow = [
export const actionsThatModifyTreeView = [
	// ActionTypes.SET_FIRST_LEVEL_CATEGORY_ROWS keep commented
	// ActionTypes.SET_CATEGORY_NODE_OPENED,
	ActionTypes.DELETE_CATEGORY,
	ActionTypes.SET_CATEGORY_ROW_EXPANDED,
	ActionTypes.SET_CATEGORY_ROW_COLLAPSED,
	ActionTypes.SET_CATEGORY_UPDATED,
	//ActionTypes.SET_CATEGORY_TO_VIEW,
	//ActionTypes.SET_CATEGORY_TO_EDIT,
	// ActionTypes.SET_QUESTION_TO_VIEW,
	// ActionTypes.SET_QUESTION_TO_EDIT,
	ActionTypes.CLOSE_CATEGORY_FORM,
	ActionTypes.CANCEL_CATEGORY_FORM,
	ActionTypes.ADD_QUESTION
]
	*/

export const actionTypesStoringToLocalStorage = [
	// ActionTypes.SET_CATEGORY_NODE_OPENED
	ActionTypes.SET_CATEGORY_ROW_EXPANDED,
	ActionTypes.SET_CATEGORY_ROW_COLLAPSED,
	ActionTypes.SET_CATEGORY_TO_VIEW,
	ActionTypes.SET_CATEGORY_TO_EDIT,
	ActionTypes.SET_QUESTION_TO_VIEW,
	ActionTypes.SET_QUESTION_TO_EDIT,
	ActionTypes.FORCE_OPEN_CATEGORY_NODE
];


export type CategoriesPayload = {


	[ActionTypes.SET_TOP_CATEGORY_ROWS_LOADING]: {
		categoryRow?: ICategoryRow;
	}

	[ActionTypes.SET_LOADING]: {
		categoryRow?: ICategoryRow;
	}

	[ActionTypes.SET_CATEGORY_LOADING]: {
		categoryRow?: ICategoryRow;
		id: string;
		loading: boolean;
	}

	[ActionTypes.SET_CATEGORY_QUESTIONS_LOADING]: {
		categoryRow?: ICategoryRow;
		questionLoading: boolean;
	}

	[ActionTypes.CATEGORY_NODE_OPENING]: {
		categoryRow?: ICategoryRow;
		//categoryKeyExpanded: ICategoryKeyExpanded
	};

	[ActionTypes.SET_CATEGORY_NODE_OPENED]: {
		// categoryNodesUpTheTree: ICategoryKeyExtended[]; /// we could have used Id only
		categoryRow: ICategoryRow;
		// categoryKeyExpanded: ICategoryKeyExpanded;
		questionId: string | null,
		fromChatBotDlg: boolean;
	};


	[ActionTypes.SET_TOP_CATEGORY_ROWS]: {
		categoryRow?: ICategoryRow;
		topCategoryRows: ICategoryRow[];
	};

	[ActionTypes.SET_SUB_CATEGORIES]: {
		categoryRow?: ICategoryRow;
		id: string | null;
		categoryRows: ICategoryRow[];
	};

	[ActionTypes.ADD_SUB_CATEGORY]: {
		categoryRow?: ICategoryRow;
		rootId: string,
		categoryKey: ICategoryKey,
		level: number
	}

	[ActionTypes.CATEGORY_TITLE_CHANGED]: {
		categoryRow?: ICategoryRow;
		id: string;
		value: string;
	}

	[ActionTypes.QUESTION_TITLE_CHANGED]: {
		categoryRow?: ICategoryRow;
		categoryId: string;
		id: string;
		value: string;
	}



	[ActionTypes.CANCEL_ADD_SUB_CATEGORY]: {
		categoryRow?: ICategoryRow;
	}


	[ActionTypes.SET_CATEGORY]: {
		categoryRow: ICategory;
	};


	[ActionTypes.SET_CATEGORY_TO_VIEW]: {
		categoryRow: ICategoryRow; // ICategory extends ICategoryRow
	};

	[ActionTypes.SET_CATEGORY_TO_EDIT]: {
		categoryRow: ICategoryRow; // ICategory extends ICategoryRow
	};

	[ActionTypes.SET_CATEGORY_UPDATED]: {
		categoryRow: ICategoryRow; // ICategory extends ICategoryRow
	};


	[ActionTypes.SET_CATEGORY_ROW_EXPANDED]: {
		categoryRow: ICategoryRow;
		formMode: FormMode;
	};

	[ActionTypes.SET_CATEGORY_ROW_COLLAPSED]: {
		categoryRow: ICategoryRow;
	};

	[ActionTypes.SET_CATEGORY_ADDED]: {
		categoryRow?: ICategoryRow;
		//category: ICategory;
	};

	[ActionTypes.DELETE_CATEGORY]: {
		categoryRow?: ICategoryRow;
		id: string;
	};


	[ActionTypes.CLOSE_CATEGORY_FORM]: {
		categoryRow?: ICategoryRow;
	};

	[ActionTypes.CANCEL_CATEGORY_FORM]: {
		categoryRow?: ICategoryRow;
	};


	[ActionTypes.SET_ERROR]: {
		categoryRow?: ICategoryRow;
		error: Error;
		whichRowId?: string;
	};

	[ActionTypes.RESET_CATEGORY_QUESTION_DONE]: {
		categoryRow?: ICategoryRow
	};

	[ActionTypes.FORCE_OPEN_CATEGORY_NODE]: {
		categoryRow?: ICategoryRow,
		categoryKeyExpanded: ICategoryKeyExpanded
	};



	/////////////
	// questions
	[ActionTypes.LOAD_CATEGORY_QUESTIONS]: {
		categoryRow: ICategoryRow
	};

	[ActionTypes.ADD_QUESTION]: {
		categoryRow?: ICategoryRow;
		categoryInfo: ICategoryInfo;
	}

	[ActionTypes.CANCEL_ADD_QUESTION]: {
		categoryRow?: ICategoryRow;
	}


	[ActionTypes.SET_QUESTION_TO_VIEW]: {
		categoryRow?: ICategoryRow;
		question: IQuestion;
	};

	[ActionTypes.SET_QUESTION_TO_EDIT]: {
		categoryRow?: ICategoryRow;
		question: IQuestion;
	};

	[ActionTypes.SET_QUESTION_SELECTED]: {
		categoryRow?: ICategoryRow;
		questionKey: IQuestionKey;
	};

	[ActionTypes.SET_QUESTION]: {
		categoryRow?: ICategoryRow;
		formMode: FormMode;
		question: IQuestion;
	};

	[ActionTypes.SET_QUESTION_AFTER_ASSIGN_ANSWER]: {
		categoryRow?: ICategoryRow;
		question: IQuestion
	};

	[ActionTypes.SET_QUESTION_ANSWERS]: {
		categoryRow?: ICategoryRow;
		answers: IAssignedAnswer[];
	};

	[ActionTypes.DELETE_QUESTION]: {
		categoryRow?: ICategoryRow;
		question: IQuestion
	};

	[ActionTypes.CLOSE_QUESTION_FORM]: {
		categoryRow?: ICategoryRow;
		question: IQuestion;
	};

	[ActionTypes.CANCEL_QUESTION_FORM]: {
		categoryRow?: ICategoryRow;
		question: IQuestion;
	};
};

export type CategoriesActions =
	ActionMap<CategoriesPayload>[keyof ActionMap<CategoriesPayload>];

