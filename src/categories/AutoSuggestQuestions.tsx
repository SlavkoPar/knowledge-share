import React, { JSX } from 'react';
import Autosuggest from 'react-autosuggest';
import AutosuggestHighlightMatch from "autosuggest-highlight/match";
import AutosuggestHighlightParse from "autosuggest-highlight/parse";
import { isMobile } from 'react-device-detect'

import { debounce, escapeRegexCharacters } from 'common/utilities'
import './AutoSuggestQuestions.css'
import { ICategoryRow, IQuestionKey, IQuestionRow, QuestionKey } from 'categories/types';


interface ICatMy {
	id: string,
	parentCategoryUp: string,
	categoryParentTitle: string,
	categoryTitle: string,
	questionRows: IQuestionRow[]
}

interface ICatSection {
	id: string | null,
	categoryTitle: string,
	parentCategoryUp: string,
	categoryParentTitle: string, // TODO ???
	questionRows: IQuestionRow[]
}

// https://developer.mozilla.org/en/docs/Web/JavaScript/Guide/Regular_Expression
// s#Using_Special_Characters
// function escapeRegexCharacters(str: string): string {
// 	return str.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
// }

// autoFocus does the job
//let inputAutosuggest = createRef<HTMLInputElement>();
interface ICatIdTitle {
	id: string;
	title: string;
}

const QuestionAutosuggestMulti = Autosuggest as { new(): Autosuggest<IQuestionRow, ICatMy> };

export class AutoSuggestQuestions extends React.Component<{
	tekst: string | undefined,
	onSelectQuestion: (questionKey: IQuestionKey, underFilter: string) => void,
	categoryRows: Map<string, ICategoryRow>,
	searchQuestions: (filter: string, count: number) => Promise<IQuestionRow[]>
}, any> {
	// region Fields
	state: any;
	isMob: boolean;
	categoryRows: Map<string, ICategoryRow>;
	searchQuestions: (filter: string, count: number) => Promise<IQuestionRow[]>;
	debouncedLoadSuggestions: (value: string) => void;
	//inputAutosuggest: React.RefObject<HTMLInputElement>;
	// endregion region Constructor
	constructor(props: any) {
		console.log("AutoSuggestQuestions CONSTRUCTOR")
		super(props);
		this.state = {
			value: props.tekst || '',
			suggestions: [], //this.getSuggestions(''),
			noSuggestions: false,
			highlighted: ''
		};
		//this.inputAutosuggest = createRef<HTMLInputElement>();
		this.categoryRows = props.categoryRows;
		this.searchQuestions = props.searchQuestions;
		this.isMob = isMobile;
		this.loadSuggestions = this.loadSuggestions.bind(this);
		this.debouncedLoadSuggestions = debounce(this.loadSuggestions, 300);
	}

	async loadSuggestions(value: string) {
		this.setState({
			isLoading: true
		});

		console.time();
		const suggestions = await this.getSuggestions(value);
		console.timeEnd();

		if (value === this.state.value) {
			this.setState({
				isLoading: false,
				suggestions,
				noSuggestions: suggestions.length === 0
			});
		}
		else { // Ignore suggestions if input value changed
			this.setState({
				isLoading: false
			});
		}
	}

	componentDidMount() {
		setTimeout(() => {
			window.focus()
			// inputAutosuggest!.current!.focus();
		}, 300)
	}

	// endregion region Rendering methods
	render(): JSX.Element {
		const { value, suggestions, noSuggestions } = this.state;

		return <div>
			<QuestionAutosuggestMulti
				onSuggestionsClearRequested={this.onSuggestionsClearRequested}  // (sl) added
				multiSection={true}
				suggestions={suggestions}
				onSuggestionsFetchRequested={this.onSuggestionsFetchRequested.bind(this)}
				onSuggestionSelected={this.onSuggestionSelected.bind(this)}
				getSuggestionValue={this.getSuggestionValue}
				renderSuggestion={this.renderSuggestion}
				renderSectionTitle={this.renderSectionTitle}
				getSectionSuggestions={this.getSectionSuggestions}
				// onSuggestionHighlighted={this.onSuggestionHighlighted} (sl)
				onSuggestionHighlighted={this.onSuggestionHighlighted.bind(this)}
				highlightFirstSuggestion={false}
				renderInputComponent={this.renderInputComponent}
				// renderSuggestionsContainer={this.renderSuggestionsContainer}
				focusInputOnSuggestionClick={!this.isMob}
				inputProps={{
					placeholder: `Type 'remote'`,
					value,
					onChange: (e, changeEvent) => this.onChange(e, changeEvent),
					autoFocus: true
				}}
			/>
			{noSuggestions &&
				<div className="no-suggestions">
					No questions to suggest
				</div>
			}
		</div>
	}


	private satisfyingCategories = (searchWords: string[]): ICatIdTitle[] => {
		const arr: ICatIdTitle[] = [];
		searchWords.filter(w => w.length >= 3).forEach(w => {
			this.categoryRows.forEach(async cat => {
				const parentId = cat.id;
				let j = 0;
				// cat.words.forEach(catw => {
				// 	if (catw.includes(w)) {
				// 		console.log("Add all questions of category")
				// 		arr.push({ id: cat.id, title: cat.title })
				// 	}
				// })
			})
		})
		return arr;
	}

	protected async getSuggestions(search: string): Promise<ICatSection[]> {
		const escapedValue = escapeRegexCharacters(search.trim());
		if (escapedValue === '') {
			return [];
		}
		if (search.length < 2)
			return [];
		const catSection = new Map<string | null, IQuestionRow[]>();
		const questionKeys: IQuestionKey[] = [];
		try {
			console.log('--------->>>>> getSuggestions')
			var questionRows: IQuestionRow[] = await this.searchQuestions(escapedValue, 10);
			questionRows.forEach((questionRow: IQuestionRow) => {
				const { topId, parentId, id, title, numOfAssignedAnswers, isSelected } = questionRow;
				const questionKey = new QuestionKey(questionRow).questionKey!;
				if (!questionKeys.includes(questionKey)) {
					questionKeys.push(questionKey);

					// 2) Group questions by parentId
					const row: IQuestionRow = {
						topId,
						parentId,
						id,
						numOfAssignedAnswers,
						title,
						categoryTitle: '',
						isSelected
					}
					if (!catSection.has(parentId)) {
						catSection.set(parentId, [row]);
					}
					else {
						catSection.get(parentId)!.push(row);
					}
				}
			})
		}
		catch (error: any) {
			console.debug(error)
		};

		////////////////////////////////////////////////////////////////////////////////
		// Search for Categories title words, and add all the questions of the Category
		/*
		if (questionKeys.length === 0) {
			try {
				const tx = this.dbp!.transaction('Questions')
				const index = tx.store.index('parentCategory_idx');
				const catIdTitles = this.satisfyingCategories(searchWords)
				let i = 0;
				while (i < catIdTitles.length) {
					const catIdTitle = catIdTitles[i];
					const parentId = catIdTitle.id;
					for await (const cursor of index.iterate(parentId)) {
						const q: IQuestion = cursor.value;
						const { id, title } = q;
						//if (!questionRows.includes(id!))
						//	questionRows.push(id!);

						const questionKey = { parentId, id }
						if (!questionKeys.includes(questionKey)) {
							questionKeys.push(questionKey);

							//console.log(q);
							// 2) Group questions by parentId
							const quest: IQuestionRow = {
								id,
								parentId,
								title,
								categoryTitle: catIdTitle.title
							}
							if (!catQuests.has(parentId)) {
								catQuests.set(parentId, [quest]);
							}
							else {
								catQuests.get(parentId)!.push(quest);
							}
						}
					}
					await tx.done;
				}
			}
			catch (error: any) {
				console.debug(error)
			};
		}
		await tx.done;
		*/

		if (questionKeys.length === 0)
			return [];

		try {
			////////////////////////////////////////////////////////////
			// map
			// 0 = {'DALJINSKI' => IQuestionRow[2]}
			// 1 = {'EDGE2' => IQuestionRow[3]}
			// 2 = {'EDGE3' => IQuestionRow[4]}4

			////////////////////////////////////////////////////////////
			// 
			let catSections: ICatSection[] = [];
			catSection.forEach((quests, id) => {
				let variationsss: string[] = [];
				const catSection: ICatSection = {
					id,
					categoryTitle: '',
					categoryParentTitle: 'kuro',
					parentCategoryUp: '',
					questionRows: []
				};
				if (id !== null) {
					const cat = this.categoryRows.get(id);
					if (cat) {
						const { title, titlesUpTheTree/*, variations*/ } = cat!;
						catSection.categoryTitle = title;
						catSection.parentCategoryUp = titlesUpTheTree!;
						//variationsss = variations;
					}
					else {
						alert(`${id} Not found in allCats`)
					}
				}
				else {
				}
				// const catSection: ICatSection = {
				// 	id: id,
				// 	categoryTitle: title,
				// 	categoryParentTitle: 'kuro',
				// 	parentCategoryUp: titlesUpTheTree!,
				// 	questionRows: []
				// };
				quests.forEach(quest => {
					// console.log(quest);
					/*
					if (variationsss.length > 0) {
						let wordsIncludesTag = false;
						// searchWords.forEach(w => {
						// 	variationsss.forEach(variation => {
						// 		if (variation === w.toUpperCase()) {
						// 			wordsIncludesTag = true;
						// 			catSection.quests.push({ ...quest, title: quest.title + ' ' + variation });
						// 		}
						// 	})
						// })
						if (!wordsIncludesTag) {
							// variationsss.forEach(variation => {
							// 	// console.log(quest);
							// 	catSection.questionRows.push({ ...quest, title: quest.title + ' ' + variation });
							// });
						}
					}
					else {
					*/
					catSection.questionRows.push(quest);
					/*}*/
				});
				catSections.push(catSection);
				//console.log(catSections)
			});
			return catSections;
		}
		catch (error: any) {
			console.log(error)
		};
		return [];
	}


	protected onSuggestionsClearRequested = () => {
		this.setState({
			suggestions: [],
			noSuggestions: false
		});
	};

	protected onSuggestionSelected(event: React.FormEvent<any>, data: Autosuggest.SuggestionSelectedEventData<IQuestionRow>): void {
		const question: IQuestionRow = data.suggestion;
		const { topId, parentId, id} = question;
		// alert(`Selected question is ${question.questionId} (${question.text}).`);
		this.props.onSelectQuestion({ topId, parentId, id }, this.state.value);
	}

	/*
	protected renderSuggestion(suggestion: Question, params: Autosuggest.RenderSuggestionParams): JSX.Element {
		 const className = params.isHighlighted ? "highlighted" : undefined;
		 return <span className={className}>{suggestion.name}</span>;
	}
	*/

	// TODO bac ovo u external css   style={{ textAlign: 'left'}}
	protected renderSuggestion(suggestion: IQuestionRow, params: Autosuggest.RenderSuggestionParams): JSX.Element {
		// const className = params.isHighlighted ? "highlighted" : undefined;
		//return <span className={className}>{suggestion.name}</span>;
		const matches = AutosuggestHighlightMatch(suggestion.title, params.query);
		const parts = AutosuggestHighlightParse(suggestion.title, matches);
		return (
			<span className="d-inline-block text-truncate" style={{ textAlign: 'left' }}>
				{parts.map((part, index) => {
					const cls = part.highlight ? 'react-autosuggest__suggestion-match' : undefined;
					return (
						<span key={index} className={`${cls ?? ''}`}>
							{part.text}
						</span>
					);
				})}
			</span>
		);
	}

	protected renderSectionTitle(section: ICatMy): JSX.Element {
		const { parentCategoryUp, categoryParentTitle, categoryTitle } = section;
		// let str = (categoryParentTitle ? (categoryParentTitle + " / ") : "") + categoryTitle;
		// if (parentCategoryUp)
		// 	str = " ... / " + str;
		return <span>{parentCategoryUp}</span>
		// <strong>
		//{parentCategoryUp}
		// </strong>;
	}

	// protected renderInputComponent(inputProps: Autosuggest.InputProps<IQuestionShort>): JSX.Element {
	// 	 const { onChange, onBlur, ...restInputProps } = inputProps;
	// 	 return (
	// 		  <div>
	// 				<input {...restInputProps} />
	// 		  </div>
	// 	 );
	// }

	protected renderInputComponent(inputProps: Autosuggest.RenderInputComponentProps): JSX.Element {
		const { ref, ...restInputProps } = inputProps;
		// if (ref !== undefined)
		// 	this.inputAutosuggest = ref as React.RefObject<HTMLInputElement>;

		return (
			<div>
				{/* <input {...restInputProps} ref={inputAutosuggest} /> */}
				<input ref={ref} autoFocus {...restInputProps} />
			</div>
		);
	}

	// const Input = forwardRef<HTMLInputElement, Omit<InputProps, "ref">>(
	// 	(props: Omit<InputProps, "ref">, ref): JSX.Element => (
	// 	  <input {...props} ref={ref} />
	// 	)
	//   );

	// protected renderSuggestionsContainer({ containerProps, children, query }:
	// 	Autosuggest.RenderSuggestionsContainerParams): JSX.Element {
	// 	return (
	// 		<div {...containerProps}>
	// 			<span>{children}</span>
	// 		</div>
	// 	);
	// }
	// endregion region Event handlers

	protected onChange(event: /*React.ChangeEvent<HTMLInputElement>*/ React.FormEvent<any>, { newValue, method }: Autosuggest.ChangeEvent): void {
		this.setState({ value: newValue });
	}

	// getParentTitle = async (id: string): Promise<any> => {
	// 	let category = await this.dbp.get('Categories', id);
	// 	return { parentCategoryTitle: category.title, parentCategoryUp: '' };
	// }

	protected async onSuggestionsFetchRequested({ value }: any): Promise<void> {
		return /*await*/ this.debouncedLoadSuggestions(value);
	}

	private anyWord = (valueWordRegex: RegExp[], questionWords: string[]): boolean => {
		for (let valWordRegex of valueWordRegex)
			for (let questionWord of questionWords)
				if (valWordRegex.test(questionWord))
					return true;
		return false;
	}

	////////////////////////////////////
	// endregion region Helper methods

	protected getSuggestionValue(suggestion: IQuestionRow) {
		return suggestion.title;
	}

	protected getSectionSuggestions(section: ICatMy) {
		return section.questionRows;
	}

	protected onSuggestionHighlighted(params: Autosuggest.SuggestionHighlightedParams): void {
		this.setState({
			highlighted: params.suggestion
		});
	}
	// endregion
}