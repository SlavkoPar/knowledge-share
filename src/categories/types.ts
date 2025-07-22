import { ActionMap, IWhoWhen, IRecord, IDto, Dto2WhoWhen, WhoWhen2Dto, IWhoWhenDto, IDtoKey } from 'global/types';
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


export interface ICategoryRowDto extends IDtoKey {
	Kind: number;
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


export interface ICategoryKey extends IRecord {
	topId: string,
	id: string;
	parentId: string | null;
}

export interface ICategoryRow extends ICategoryKey {
	kind: number;
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


export interface ICategoryKeyExtended extends ICategoryKey {
	title: string;
}

export class CategoryRowDto {
	constructor(categoryRow: ICategoryRow) {
		const { topId, id, parentId, modified } = categoryRow;
		this.categoryRowDto = {
			TopId: topId,
			Id: id,
			ParentId: parentId,
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
		const { TopId, Id, ParentId, Kind, Title, Link, Header, Variations, Level,
			HasSubCategories, SubCategoryRowDtos,
			NumOfQuestions, QuestionRowDtos,
			IsExpanded } = categoryRowDto;
		this.categoryRow = {
			topId: TopId,
			id: Id,
			parentId: ParentId,
			title: Title,
			link: Link,
			header: Header,
			titlesUpTheTree: '', // traverse up the tree, until root
			variations: Variations,
			hasSubCategories: HasSubCategories!,
			categoryRows: SubCategoryRowDtos.map(dto => new CategoryRow({ ...dto, TopId }).categoryRow),
			numOfQuestions: NumOfQuestions,
			questionRows: QuestionRowDtos
				? QuestionRowDtos.map(dto => new QuestionRow({ ...dto, TopId: TopId ?? undefined }).questionRow)
				: [],
			level: Level,
			kind: Kind,
			isExpanded: IsExpanded
		}
	}
	categoryRow: ICategoryRow;
}


/////////////////////////////////////
// Question

export interface IQuestionKey extends ICategoryKey {
	questionId: string | null;
}

export interface IQuestionRow extends IQuestionKey {
	title: string;
	numOfAssignedAnswers: number;
	categoryTitle?: string;
	isSelected?: boolean;
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


export interface IVariation {
	name: string;
}

// ICategory rather than ICategoryRow
export const IsCategory = (obj: any): boolean => typeof obj === 'object' && obj !== null &&
	obj.hasOwnProperty('doc1') && typeof obj.doc1 === 'string';



export class QuestionRow {
	constructor(rowDto: IQuestionRowDto) { //, parentId: string) {
		const { TopId, Id, ParentId, QuestionId, NumOfAssignedAnswers, Title, CategoryTitle, Created, Modified, Included } = rowDto;
		this.questionRow = {
			topId: TopId,
			id: Id,
			parentId: ParentId,
			questionId: QuestionId,
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
	constructor(row: IQuestionRow) { //, parentId: string) {
		const { topId, parentId, id, numOfAssignedAnswers, created, modified, isSelected } = row;
		this.questionRowDto = {
			TopId: topId,
			Id: id,
			ParentId: parentId ?? '',
			QuestionId: id,
			NumOfAssignedAnswers: numOfAssignedAnswers ?? 0,
			Title: '',
			CategoryTitle: '',
			Created: new WhoWhen2Dto(created!).whoWhenDto!,
			Modified: new WhoWhen2Dto(modified).whoWhenDto!,
			Included: isSelected
		}
	}
	questionRowDto: IQuestionRowDto
}


export class CategoryKey {
	constructor(cat: ICategoryRow | ICategory | ICategoryKeyExtended) {
		this.categoryKey = {
			topId: cat.topId,
			parentId: cat.parentId,
			id: cat.id
		}
	}
	categoryKey: ICategoryKey;
}



export class Category {
	constructor(dto: ICategoryDto) {
		const { TopId, Id, ParentId, Kind, Title, Link, Header, Level, Variations, NumOfQuestions,
			HasSubCategories, SubCategoryRowDtos, Created, Modified, QuestionRowDtos, IsExpanded, Doc1 } = dto;

		const categoryRows = SubCategoryRowDtos
			? SubCategoryRowDtos.map((rowDto: ICategoryRowDto) => new CategoryRow(rowDto).categoryRow)
			: [];

		const questionRows = QuestionRowDtos
			? QuestionRowDtos.map((dto: IQuestionDto) => new Question(dto).question)
			: [];

		this.category = {
			topId: TopId,
			id: Id,
			parentId: ParentId!,
			kind: Kind,
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
		const { topId, id,parentId,  kind, title, link, header, level, variations, created, modified, doc1 } = category;
		this.categoryDto = {
			TopId: topId,
			Id: id,
			Kind: kind,
			ParentId: parentId,
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
	constructor(dto: IQuestionDto) { //, parentId: string) {
		const assignedAnswers = dto.AssignedAnswerDtos ?
			dto.AssignedAnswerDtos.map((dto: IAssignedAnswerDto) => new AssignedAnswer(dto).assignedAnswer)
			: [];
		const relatedFilters = dto.RelatedFilterDtos
			? dto.RelatedFilterDtos.map((Dto: IRelatedFilterDto) => new RelatedFilter(Dto).relatedFilter)
			: [];
		// TODO possible to call base class construtor
		this.question = {
			topId: dto.TopId, // TODO will be set later
			id: dto.Id,
			parentId: dto.ParentId,
			questionId: dto.QuestionId,
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
				topId: question.topId,
				parentId: question.parentId ?? null,
				id: question.id,
				questionId: question.questionId
			}
			: null
	}
	questionKey: IQuestionKey | null;
}

export class QuestionDto {
	constructor(question: IQuestion) {
		const { topId, id, parentId, questionId, title, source, status, created, modified,
			numOfAssignedAnswers, numOfRelatedFilters } = question;
		this.questionDto = {
			TopId: topId,
			Id: id,
			QuestionId: questionId!,
			ParentId: parentId ?? 'null',  // TODO proveri
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

export interface IQuestionRowDto extends IDtoKey {
	QuestionId: string;
	NumOfAssignedAnswers?: number,
	Title: string;
	CategoryTitle?: string;
	Included?: boolean;
	Source?: number;
	Status?: number;
}

export interface IQuestionRowDtosEx {
	questionRowDtos: IQuestionRowDto[];
	msg: string;
}

export interface IQuestionDto extends IQuestionRowDto {
	AssignedAnswerDtos?: IAssignedAnswerDto[];
	RelatedFilterDtos?: IRelatedFilterDto[]
	NumOfRelatedFilters?: number;
	oldParentId?: string;
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
	topId: string;
	categoryKey: ICategoryKey;
	formMode: FormMode;
	includeQuestionId?: string;
	newCategoryRow?: ICategoryRow;
	newQuestion?: IQuestionRow;
}


export interface IParentInfo {
	//execute?: (method: string, endpoint: string) => Promise<any>,
	// topId: string | null,
	// parentId: string | null,
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
	topRows: ICategoryRow[];
	topRowsLoading: boolean;
	topRowsLoaded: boolean;
	keyExpanded: IQuestionKey | null; // ICategoryKey + questionId
	categoryId_questionId_done?: string;
	nodeOpening: boolean;
	nodeOpened: boolean;
	activeCategory: ICategory | null;
	activeQuestion: IQuestion | null;
	loadingCategories: boolean,
	loadingQuestions: boolean,
	loadingCategory: boolean,
	loadingQuestion: boolean,
	error?: Error;
	whichRowId?: string; // category.id or question.id
}

export interface ILocStorage {
	lastKeyExpanded: ICategoryKey | null;
	lastQuestionId: string | null;
}

export interface ILoadCategoryQuestions {
	categoryKey: ICategoryKey,
	startCursor: number,
	includeQuestionId: string | null
}

export interface ICategoriesContext {
	state: ICategoriesState,
	openNode: (keyExpanded: IQuestionKey, fromChatBotDlg?: string) => Promise<any>;
	loadTopRows: () => Promise<any>,
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
	addQuestion: (categoryKey: ICategoryKey, topId: string) => Promise<any>;
	cancelAddQuestion: () => Promise<any>;
	createQuestion: (question: IQuestion, fromModal: boolean) => Promise<any>;
	viewQuestion: (questionRow: IQuestionRow) => void;
	editQuestion: (questionRow: IQuestionRow) => void;
	updateQuestion: (oldParentId: string, question: IQuestion, categoryChanged: boolean) => Promise<any>;
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
	SET_TOP_ROWS = 'SET_TOP_ROWS',
	SET_NODE_OPENED = "SET_NODE_OPENED",
	SET_LOADING_CATEGORY = 'SET_LOADING_CATEGORY',
	SET_LOADING_QUESTION = 'SET_LOADING_QUESTION',
	SET_TOP_ROWS_LOADING = 'SET_TOP_ROWS_LOADING',
	SET_CATEGORY_QUESTIONS_LOADING = 'SET_CATEGORY_QUESTIONS_LOADING',
	SET_SUB_CATEGORIES = 'SET_SUB_CATEGORIES',
	SET_ERROR = 'SET_ERROR',
	ADD_SUB_CATEGORY = 'ADD_SUB_CATEGORY',
	CATEGORY_TITLE_CHANGED = 'CATEGORY_TITLE_CHANGED',
	CANCEL_ADD_SUB_CATEGORY = 'CANCEL_ADD_SUB_CATEGORY',
	SET_CATEGORY = 'SET_CATEGORY',
	SET_CATEGORY_ROW = 'SET_CATEGORY_ROW',
	SET_ROW_EXPANDING = 'SET_ROW_EXPANDING',
	SET_ROW_EXPANDED = 'SET_ROW_EXPANDED',
	SET_ROW_COLLAPSING = 'SET_ROW_COLLAPSING',
	SET_ROW_COLLAPSED = 'SET_ROW_COLLAPSED',
	SET_CATEGORY_ADDED = 'SET_CATEGORY_ADDED',
	SET_CATEGORY_TO_VIEW = 'SET_CATEGORY_TO_VIEW',
	SET_CATEGORY_TO_EDIT = 'SET_CATEGORY_TO_EDIT',
	SET_CATEGORY_UPDATED = 'SET_CATEGORY_UPDATED',
	DELETE_CATEGORY = 'DELETE_CATEGORY',
	RESET_CATEGORY_QUESTION_DONE = 'RESET_CATEGORY_QUESTION_DONE',

	CLOSE_CATEGORY_FORM = 'CLOSE_CATEGORY_FORM',
	CANCEL_CATEGORY_FORM = 'CANCEL_CATEGORY_FORM',

	NODE_OPENING = "NODE_OPENING",
	FORCE_OPEN_NODE = "FORCE_OPEN_NODE",

	// questions
	CATEGORY_QUESTIONS_LOADED = 'CATEGORY_QUESTIONS_LOADED',
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
export const actionsThatModifyTree = [
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



export const actionStoringToLocalStorage = [
	// ActionTypes.SET_CATEGORY_NODE_OPENED
	ActionTypes.SET_ROW_EXPANDED,
	ActionTypes.SET_ROW_COLLAPSED,
	ActionTypes.SET_CATEGORY_TO_VIEW,
	ActionTypes.SET_CATEGORY_TO_EDIT,
	ActionTypes.SET_QUESTION_TO_VIEW,
	ActionTypes.SET_QUESTION_TO_EDIT,
	ActionTypes.FORCE_OPEN_NODE
];


export type CategoriesPayload = {

	[ActionTypes.SET_TOP_ROWS_LOADING]: {
		categoryRow?: ICategoryRow;
	}

	[ActionTypes.SET_LOADING_CATEGORY]: {
		categoryRow?: ICategoryRow;
	}

	[ActionTypes.SET_LOADING_QUESTION]: {
		categoryRow?: ICategoryRow;
	}

	[ActionTypes.SET_CATEGORY_QUESTIONS_LOADING]: {
		categoryRow?: ICategoryRow;
		loadingQuestion: boolean;
	}

	[ActionTypes.NODE_OPENING]: {
		categoryRow?: ICategoryRow;
		fromChatBotDlg: boolean;
		//categoryKeyExpanded: IQuestionKey
	};

	[ActionTypes.SET_NODE_OPENED]: {
		// categoryNodesUpTheTree: ICategoryKeyExtended[]; /// we could have used Id only
		categoryRow: ICategoryRow;
		keyExpanded: IQuestionKey;
		//questionId: string | null,
		fromChatBotDlg: boolean;
	};


	[ActionTypes.SET_TOP_ROWS]: {
		categoryRow?: ICategoryRow;
		topRows: ICategoryRow[];
	};

	[ActionTypes.SET_SUB_CATEGORIES]: {
		categoryRow?: ICategoryRow;
		id: string | null;
		categoryRows: ICategoryRow[];
	};

	[ActionTypes.ADD_SUB_CATEGORY]: {
		categoryRow?: ICategoryRow;
		topId: string,
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


	[ActionTypes.SET_ROW_EXPANDING]: {
		categoryRow?: ICategoryRow;
	};

	[ActionTypes.SET_ROW_EXPANDED]: {
		categoryRow: ICategoryRow;
		formMode: FormMode;
	};

	[ActionTypes.SET_ROW_COLLAPSING]: {
		categoryRow?: ICategoryRow;
	};

	[ActionTypes.SET_ROW_COLLAPSED]: {
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

	[ActionTypes.FORCE_OPEN_NODE]: {
		categoryRow?: ICategoryRow,
		keyExpanded: IQuestionKey
	};



	/////////////
	// questions
	[ActionTypes.CATEGORY_QUESTIONS_LOADED]: {
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

