import React, { JSX } from 'react';
import Autosuggest from 'react-autosuggest';
import AutosuggestHighlightMatch from "autosuggest-highlight/match";
import AutosuggestHighlightParse from "autosuggest-highlight/parse";
import { isMobile } from 'react-device-detect'

import { debounce, escapeRegexCharacters } from 'common/utilities'
import './AutoSuggestAnswers.css'
import { IAnswerRow, IAnswerKey, IAnswerRowDto, IGroupRow } from 'groups/types';


interface IGoupMy {
	id: string,
	parentGroupUp: string,
	groupParentTitle: string,
	groupTitle: string,
	shortAnswers: IAnswerRow[]
}

interface IGroupSection {
	id: string | null,
	groupTitle: string,
	parentGroupUp: string,
	groupParentTitle: string, // TODO ???
	shortAnswers: IAnswerRow[]
}

// https://developer.mozilla.org/en/docs/Web/JavaScript/Guide/Regular_Expression
// s#Using_Special_Characters
// function escapeRegexCharacters(str: string): string {
// 	return str.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
// }

// autoFocus does the job
//let inputAutosuggest = createRef<HTMLInputElement>();
interface IShortGroupIdTitle {
	id: string;
	title: string;
}

const AnswerAutosuggestMulti = Autosuggest as { new(): Autosuggest<IAnswerRow, IGoupMy> };

export class AutoSuggestAnswers extends React.Component<{
	tekst: string | undefined,
	onSelectGroupAnswer: (answerKey: IAnswerKey) => void,
	alreadyAssigned?: string[],
	shortGroups: Map<string, IGroupRow>,
	searchAnswers: (filter: string, count: number) => Promise<IAnswerRow[]>

}, any> {
	// region Fields
	alreadyAssigned: string[];
	state: any;
	isMob: boolean;
	shortGroups: Map<string, IGroupRow>;
	searchAnswers: (filter: string, count: number) => Promise<IAnswerRow[]>;
	debouncedLoadSuggestions: (value: string) => void;
	//inputAutosuggest: React.RefObject<HTMLInputElement>;
	// endregion region Constructor
	constructor(props: any) {
		console.log("CONSTRUCTOR")
		super(props);
		this.state = {
			value: props.tekst || '',
			suggestions: [], //this.getSuggestions(''),
			noSuggestions: false,
			highlighted: ''
		};
		//this.inputAutosuggest = createRef<HTMLInputElement>();
		this.alreadyAssigned = props.alreadyAssigned ?? [];
		this.shortGroups = props.shortGroups;
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
		console.log('>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>', value, this.state.value,
			suggestions.length, { suggestions })
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


	private satisfyingGroups = (searchWords: string[]): IShortGroupIdTitle[] => {
		const arr: IShortGroupIdTitle[] = [];
		searchWords.filter(w => w.length >= 3).forEach(w => {
			this.shortGroups.forEach(async group => {
				//const parentGroup = group.groupKey.id;
				const parentGroup = group.parentGroup;
				let j = 0;
				// grp.words.forEach(grpw => {
				// 	if (grpw.includes(w)) {
				// 		console.log("Add all answers of group")
				// 		arr.push({ id: grp.id, title: grp.title })
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
			var shortAnswerList: IAnswerRow[] = await this.searchAnswers(escapedValue, 20);
			shortAnswerList.forEach((shortAnswer: IAnswerRow) => {
				const { partitionKey, id, parentGroup, title } = shortAnswer;
				if (!this.alreadyAssigned.includes(id)) {
					const answerKey = { partitionKey, id }
					if (!answerKeys.includes(answerKey)) {
						answerKeys.push(answerKey);
					}

					//2) Group answers by parentGroup
					// const ans2: IAnswerRow = {
					// 	partitionKey,
					// 	id,
					// 	parentGroup,
					// 	title,
					// 	groupTitle: ''
					// }
					if (!groupAnswers.has(parentGroup)) {
						groupAnswers.set(parentGroup, [shortAnswer]);
					}
					else {
						groupAnswers.get(parentGroup)!.push(shortAnswer);
					}
					//}
				}
			})
		}
		catch (error: any) {
			console.debug(error)
		};

		if (answerKeys.length === 0)
			return [];

		console.log('kitaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaa =>', groupAnswers.size, { groupAnswers })

		// if (groupAnswers.size === 0)
		// 	return [];

		try {
			////////////////////////////////////////////////////////////
			// map
			// 0 = {'DALJINSKI' => IAnswerRow[2]}
			// 1 = {'EDGE2' => IAnswerRow[3]}
			// 2 = {'EDGE3' => IAnswerRow[4]}4

			////////////////////////////////////////////////////////////
			// 
			let groupSections: IGroupSection[] = [];
			groupAnswers.forEach((shortAnswers, id) => {
				const group = this.shortGroups.get(id!);
				console.log('GGGGGGGGGGGGGGGGGGGGGGGGGGGGGGGGGGGG', group)
				const { title, titlesUpTheTree/*, variations*/ } = group!;
				const groupSection: IGroupSection = {
					id,
					groupTitle: title,
					groupParentTitle: 'kuro',
					parentGroupUp: titlesUpTheTree!,
					shortAnswers: []
				};
				shortAnswers.forEach(shortAnswer => {
					// console.log(ans);
					// if (variations.length > 0) {
					// 	let wordsIncludesTag = false;
					// 	// searchWords.forEach(w => {
					// 	// 	variations.forEach(variation => {
					// 	// 		if (variation === w.toUpperCase()) {
					// 	// 			wordsIncludesTag = true;
					// 	// 			grpSection.anss.push({ ...ans, title: ans.title + ' ' + variation });
					// 	// 		}
					// 	// 	})
					// 	// })
					// 	if (!wordsIncludesTag) {
					// 		variations.forEach(variation => {
					// 			// console.log(ans);
					// 			groupSection.shortAnswers.push({ ...shortAnswer, title: shortAnswer.title + ' ' + variation });
					// 		});
					// 	}
					// }
					// else {
					groupSection.shortAnswers.push(shortAnswer);
					// }
				});
				groupSections.push(groupSection);
				console.log('AutoSuggestAnswers', { groupSection });
			});
			console.log({ groupSections })
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
		alert(`Selected answer is ${answer.partitionKey} / ${answer.id}.`);
		this.props.onSelectGroupAnswer({ partitionKey: answer.partitionKey, id: answer.id });
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
			<span style={{ textAlign: 'left' }} className='bg-info'>
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

	protected renderSectionTitle(section: IGoupMy): JSX.Element {
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

	// getParentTitle = async (id: string): Promise<any> => {
	// 	let group = await this.dbp.get('Groups', id);
	// 	return { parentGroupTitle: group.title, parentGroupUp: '' };
	// }

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

	protected getSectionSuggestions(section: IGoupMy) {
		console.log('****************************** getSectionSuggestions', section)
		return section.shortAnswers;
	}

	protected onSuggestionHighlighted(params: Autosuggest.SuggestionHighlightedParams): void {
		this.setState({
			highlighted: params.suggestion
		});
	}
	// endregion
}