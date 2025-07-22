import React, { JSX } from 'react';
import Autosuggest from 'react-autosuggest';
import AutosuggestHighlightMatch from "autosuggest-highlight/match";
import AutosuggestHighlightParse from "autosuggest-highlight/parse";
import { isMobile } from 'react-device-detect'

import { debounce, escapeRegexCharacters } from 'common/utilities'
import './AutoSuggestAnswers.css'
import { AnswerKey, IAnswerKey, IAnswerRow, IGroupRow } from 'groups/types';


interface IGroupMy {
	id: string,
	parentGroupUp: string,
	groupParentTitle: string,
	groupTitle: string,
	answerRows: IAnswerRow[]
}

interface IGroupSection {
	id: string | null,
	groupTitle: string,
	parentGroupUp: string,
	groupParentTitle: string, // TODO ???
	answerRows: IAnswerRow[]
}

// https://developer.mozilla.org/en/docs/Web/JavaScript/Guide/Regular_Expression
// s#Using_Special_Characters
// function escapeRegexCharacters(str: string): string {
// 	return str.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
// }

// autoFocus does the job
//let inputAutosuggest = createRef<HTMLInputElement>();
interface IGroupIdTitle {
	id: string;
	title: string;
}

const AnswerAutosuggestMulti = Autosuggest as { new(): Autosuggest<IAnswerRow, IGroupMy> };

export class AutoSuggestAnswers extends React.Component<{
	tekst: string | undefined,
	onSelectAnswer: (answerKey: IAnswerKey, underFilter: string) => void,
	alreadyAssigned?: string[],
	groupRows: Map<string, IGroupRow>,
	searchAnswers: (filter: string, count: number) => Promise<IAnswerRow[]>
}, any> {
	// region Fields
	alreadyAssigned: string[];
	state: any;
	isMob: boolean;
	groupRows: Map<string, IGroupRow>;
	searchAnswers: (filter: string, count: number) => Promise<IAnswerRow[]>;
	debouncedLoadSuggestions: (value: string) => void;
	//inputAutosuggest: React.RefObject<HTMLInputElement>;
	// endregion region Constructor
	constructor(props: any) {
		console.log("AutoSuggestAnswers CONSTRUCTOR")
		super(props);
		this.state = {
			value: props.tekst || '',
			suggestions: [], //this.getSuggestions(''),
			noSuggestions: false,
			highlighted: ''
		};
		//this.inputAutosuggest = createRef<HTMLInputElement>();
		this.alreadyAssigned = props.alreadyAssigned ?? [];
		this.groupRows = props.groupRows;
		this.searchAnswers = props.searchAnswers;
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
			<AnswerAutosuggestMulti
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
					No answers to suggest
				</div>
			}
		</div>
	}


	private satisfyingGroups = (searchWords: string[]): IGroupIdTitle[] => {
		const arr: IGroupIdTitle[] = [];
		searchWords.filter(w => w.length >= 3).forEach(w => {
			this.groupRows.forEach(async group => {
				const parentId = group.id;
				let j = 0;
				// cat.words.forEach(catw => {
				// 	if (catw.includes(w)) {
				// 		console.log("Add all answers of group")
				// 		arr.push({ id: cat.id, title: cat.title })
				// 	}
				// })
			})
		})
		return arr;
	}

	protected async getSuggestions(search: string): Promise<IGroupSection[]> {
		const escapedValue = escapeRegexCharacters(search.trim());
		if (escapedValue === '') {
			return [];
		}
		if (search.length < 2)
			return [];
		const groupAnswers = new Map<string | null, IAnswerRow[]>();
		const answerKeys: IAnswerKey[] = [];
		try {
			console.log('--------->>>>> getSuggestions')
			var answerRows: IAnswerRow[] = await this.searchAnswers(escapedValue, 20);
			answerRows.forEach((row: IAnswerRow) => {
				const { id, topId, parentId, answerId, title, isSelected } = row;
				if (!this.alreadyAssigned.includes(id)) {
					const answerKey = new AnswerKey(row).answerKey!;
					
					if (!answerKeys.includes(answerKey)) {
						answerKeys.push(answerKey);

						// 2) Group answers by parentId
						const answ: IAnswerRow = {
							topId,
							id,
							parentId,
							answerId,
							title,
							groupTitle: '',
							isSelected
						}
						if (!groupAnswers.has(parentId)) {
							groupAnswers.set(parentId, [answ]);
						}
						else {
							groupAnswers.get(parentId)!.push(answ);
						}
					}
				}
			})
		}
		catch (error: any) {
			console.debug(error)
		};

		////////////////////////////////////////////////////////////////////////////////
		// Search for Groups title words, and add all the answers of the Group
		/*
		if (answerKeys.length === 0) {
			try {
				const tx = this.dbp!.transaction('Answers')
				const index = tx.store.index('parentGroup_idx');
				const catIdTitles = this.satisfyingGroups(searchWords)
				let i = 0;
				while (i < catIdTitles.length) {
					const catIdTitle = catIdTitles[i];
					const parentId = catIdTitle.id;
					for await (const cursor of index.iterate(parentId)) {
						const q: IAnswer = cursor.value;
						const { id, title } = q;
						//if (!answerRows.includes(id!))
						//	answerRows.push(id!);

						const answerKey = { parentId, id }
						if (!answerKeys.includes(answerKey)) {
							answerKeys.push(answerKey);

							//console.log(q);
							// 2) Group answers by parentId
							const quest: IAnswerRow = {
								id,
								parentId,
								title,
								groupTitle: catIdTitle.title
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

		if (answerKeys.length === 0)
			return [];

		try {
			////////////////////////////////////////////////////////////
			// map
			// 0 = {'DALJINSKI' => IAnswerRow[2]}
			// 1 = {'EDGE2' => IAnswerRow[3]}
			// 2 = {'EDGE3' => IAnswerRow[4]}4

			////////////////////////////////////////////////////////////
			// 
			let groupSections: IGroupSection[] = [];
			groupAnswers.forEach((quests, id) => {

				let variationsss: string[] = [];
				const groupSection: IGroupSection = {
					id,
					groupTitle: '',
					groupParentTitle: 'kuro',
					parentGroupUp: '',
					answerRows: []
				};
				if (id !== null) {
					const group = this.groupRows.get(id);
					if (group) {
						const { title, titlesUpTheTree/*, variations*/ } = group!;
						groupSection.groupTitle = title;
						groupSection.parentGroupUp = titlesUpTheTree!;
						//variationsss = variations;
					}
					else {
						alert(`${id} Not found in allGroups`)
					}
				}
				else {
				}
				// const catSection: ICatSection = {
				// 	id: id,
				// 	groupTitle: title,
				// 	groupParentTitle: 'kuro',
				// 	parentGroupUp: titlesUpTheTree!,
				// 	answerRows: []
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
							// 	catSection.answerRows.push({ ...quest, title: quest.title + ' ' + variation });
							// });
						}
					}
					else {
					*/
					groupSection.answerRows.push(quest);
					/*}*/
				});
				groupSections.push(groupSection);
				//console.log(catSections)
			});
			return groupSections;
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

	protected onSuggestionSelected(event: React.FormEvent<any>, data: Autosuggest.SuggestionSelectedEventData<IAnswerRow>): void {
		const answer: IAnswerRow = data.suggestion;
		const {topId, id, parentId, answerId} = answer;

		// alert(`Selected answer is ${answer.answerId} (${answer.text}).`);
		this.props.onSelectAnswer({ topId, parentId, id, answerId }, this.state.value);
	}

	/*
	protected renderSuggestion(suggestion: Answer, params: Autosuggest.RenderSuggestionParams): JSX.Element {
		 const className = params.isHighlighted ? "highlighted" : undefined;
		 return <span className={className}>{suggestion.name}</span>;
	}
	*/

	// TODO bac ovo u external css   style={{ textAlign: 'left'}}
	protected renderSuggestion(suggestion: IAnswerRow, params: Autosuggest.RenderSuggestionParams): JSX.Element {
		// const className = params.isHighlighted ? "highlighted" : undefined;
		//return <span className={className}>{suggestion.name}</span>;
		const matches = AutosuggestHighlightMatch(suggestion.title, params.query);
		const parts = AutosuggestHighlightParse(suggestion.title, matches);
		return (
			<span style={{ textAlign: 'left' }}>
				{parts.map((part, index) => {
					const className = part.highlight ? 'react-autosuggest__suggestion-match' : undefined;
					return (
						<span className={className} key={index}>
							{part.text}
						</span>
					);
				})}
			</span>
		);
	}

	protected renderSectionTitle(section: IGroupMy): JSX.Element {
		const { parentGroupUp, groupParentTitle, groupTitle } = section;
		// let str = (groupParentTitle ? (groupParentTitle + " / ") : "") + groupTitle;
		// if (parentGroupUp)
		// 	str = " ... / " + str;
		return <strong>
			{parentGroupUp}
		</strong>;
	}

	// protected renderInputComponent(inputProps: Autosuggest.InputProps<IAnswerShort>): JSX.Element {
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


	protected async onSuggestionsFetchRequested({ value }: any): Promise<void> {
		return /*await*/ this.debouncedLoadSuggestions(value);
	}

	private anyWord = (valueWordRegex: RegExp[], answerWords: string[]): boolean => {
		for (let valWordRegex of valueWordRegex)
			for (let answerWord of answerWords)
				if (valWordRegex.test(answerWord))
					return true;
		return false;
	}

	////////////////////////////////////
	// endregion region Helper methods

	protected getSuggestionValue(suggestion: IAnswerRow) {
		return suggestion.title;
	}

	protected getSectionSuggestions(section: IGroupMy) {
		return section.answerRows;
	}

	protected onSuggestionHighlighted(params: Autosuggest.SuggestionHighlightedParams): void {
		this.setState({
			highlighted: params.suggestion
		});
	}
	// endregion
}