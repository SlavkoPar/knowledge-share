import React, { useEffect, useState, JSX } from 'react';
import { useParams } from 'react-router-dom' // useRouteMatch

import { AutoSuggestQuestions } from 'categories/AutoSuggestQuestions';

import { Button, Col, Container, Form, ListGroup, Row } from 'react-bootstrap';
import { useGlobalContext, useGlobalState } from 'global/GlobalProvider';

import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faPlus, faQuestion } from '@fortawesome/free-solid-svg-icons'
import CatList from 'global/Components/SelectCategory/CatList';
import { ICategory, IQuestion, IQuestionEx, IQuestionKey, QuestionKey, ICategoryRow } from 'categories/types';
import { IWhoWhen, IHistory, USER_ANSWER_ACTION, IHistoryFilterDto } from 'global/types';
import AssignedAnswersChatBot from 'global/ChatBotPage/AssignedAnswersChatBot';
import { IChatBotAnswer, INewQuestion, INextAnswer, useAI } from './hooks/useAI'
import { IAnswer } from 'groups/types';
//import AnswerList from 'groups/components/answers/AnswerList';

import Q from 'assets/Q.png';
import A from 'assets/A.png';

type ChatBotParams = {
	source: string;
	tekst: string;
	email?: string;
};

const ChatBotPage: React.FC = () => {

	let { source, tekst, email } = useParams<ChatBotParams>();
	const [autoSuggestionValue, setAutoSuggestionValue] = useState(tekst!)

	// TODO do we need this?
	// const globalState = useGlobalState();
	// const {isAuthenticated} = globalState;

	// if (!isAuthenticated)
	//     return <div>loading...</div>;

	const [setNewQuestion, getCurrQuestion, getNextChatBotAnswer] = useAI([]);

	const [selectedQuestion, setSelectedQuestion] = useState<IQuestion | null>(null);

	const [autoSuggestId, setAutoSuggestId] = useState<number>(1);
	//const [answerId, setAnswerId] = useState<number>(1);
	const [showAnswer, setShowAnswer] = useState(false);
	const [chatBotAnswer, setChatBotAnswer] = useState<IChatBotAnswer | null>(null);
	const [hasMoreAnswers, setHasMoreAnswers] = useState<boolean>(false);

	const { getCatsByKind, getQuestion, addHistory, addHistoryFilter, getAnswersRated, searchQuestions, setLastRouteVisited } = useGlobalContext();
	const { dbp, canEdit, authUser, isDarkMode, variant, bg, categoryRows: cats, categoryRowsLoaded: catsLoaded, lastRouteVisited } = useGlobalState();

	const setParentId = (cat: ICategory) => {
		alert(cat.title)
	}
	const [showUsage, setShowUsage] = useState(false);
	const [catsSelected, setCatsSelected] = useState(false);
	const [showAutoSuggest, setShowAutoSuggest] = useState(false);

	const [catsOptions, setCatOptions] = useState<ICategoryRow[]>([]);
	const [catsOptionsSel, setCatsOptionsSel] = useState<Map<string, boolean>>(new Map<string, boolean>());

	const [catsUsage, setCatUsage] = useState<ICategoryRow[]>([]);
	const [catsUsageSel, setCatUsageSel] = useState<Map<string, boolean>>(new Map<string, boolean>());

	const [pastEvents, setPastEvents] = useState<IChild[]>([]);

	enum ChildType {
		AUTO_SUGGEST,
		QUESTION,
		ANSWER
	}

	interface IChild {
		type: ChildType;
		isDisabled: boolean;
		txt: string,
		link: string | null,
		hasMoreAnswers?: boolean
	}
	// const deca: JSX.Element[] = [];
	// useEffect(() => {
	// 	(async () => {
	// 		//await loadCats();
	// 	})()
	// }, [])

	// { error,



	useEffect(() => {
		(async () => {
			setCatOptions(await getCatsByKind(2));
			setCatUsage(await getCatsByKind(3));
		})()
	}, []) // [catsLoaded])

	useEffect(() => {
		//setLastRouteVisited(`/ChatBotPage/0/${encodeURIComponent('daljinski')}/xyz`);
	}, [setLastRouteVisited])


	if (!catsLoaded || catsOptions.length === 0)
		return <div>cats not loaded...</div>

	const onOptionChange = (event: React.ChangeEvent<HTMLInputElement>) => {
		const target = event.target;
		const value = target.type === 'checkbox' ? target.checked : target.value;
		const name = target.name as any;
		setShowUsage(true);
		// setCatOptions((prevState) => ({ 
		// 	stateName: prevState.stateName + 1 
		// }))
		// this.setState({
		// 	 [name]: value
		// });
	}

	//const onUsageChange = ({ target: { value } }) => {
	const onUsageChange = (event: React.ChangeEvent<HTMLInputElement>) => {
		const target = event.target;
		const value = target.type === 'checkbox' ? target.checked : target.value;
		const name = target.name as any;
		setCatsSelected(true);
		setAutoSuggestId(autoSuggestId + 1);
		setShowAutoSuggest(true);
		//setPaymentMethod(value);
	};

	//categoryId: string, questionId: string
	const onSelectQuestion = async (questionKey: IQuestionKey, underFilter: string) => {
		const questionCurr = await getCurrQuestion();
		if (questionCurr) {
			console.log({ questionCurr })
			const historyFilterDto: IHistoryFilterDto = {
				QuestionKey: new QuestionKey(questionCurr).questionKey!,
				Filter: underFilter,
				Created: { Time: new Date, NickName: authUser.nickName }
			}
			await addHistoryFilter(historyFilterDto);
		}
		// navigate(`/categories/${categoryId}_${questionId.toString()}`)
		// const question = await getQuestion(questionId);

		// salji kasnije kad klikne na Fixed
		/* TODO proveri
		if (answer) {
			const history: IHistory = {
				questionId: questionKey.id,
				answerId: answer.id,
				fixed: undefined,
				created: { 
					nickName: authUser.nickName, 
					time: new Date() 
				}
			}
			addHistory(history);
		}
		*/
		if (chatBotAnswer) {
			const props: IChild = {
				type: ChildType.ANSWER,
				isDisabled: true,
				txt: chatBotAnswer.answerTitle,
				link: chatBotAnswer.answerLink
			}
			setPastEvents((prevEvents) => [...prevEvents, props]);
		}

		const questionEx: IQuestionEx = await getQuestion(questionKey);
		const { question } = questionEx;
		if (!question) {
			//alert(questionEx.msg)
			return;
		}
		console.log('Breeeeeeeeeeeeeeeeeeeeeeeeeeeeeee:', { question })
		if (question.numOfRelatedFilters > 0) {
			setAutoSuggestionValue(question.relatedFilters[0].filter)
		}

		//const res: INewQuestion = await (await hook).setNewQuestion(question);
		const res: INewQuestion = await setNewQuestion(question);
		let { firstChatBotAnswer: firstAnswer, hasMoreAnswers } = res; // as unknown as INewQuestion;

		// const answersRatedListEx: IAnswerRatedListEx = await getAnswersRated(questionKey);
		// const { answerRatedList, msg } = answersRatedListEx;
		// let firstAnswerRated: IAnswerRated | null = answerRatedList && answerRatedList.length > 0
		// 	? answerRatedList[0]
		// 	: null;

		// console.log('answersRatedListEx 2', { answersRatedListEx });
		if (question) {
			const props: IChild = {
				type: ChildType.QUESTION,
				isDisabled: true,
				txt: question.title,
				link: null
			}
			setPastEvents((prevEvents) => [...prevEvents, props]);
		}

		setAutoSuggestId((autoSuggestId) => autoSuggestId + 1);
		setShowAutoSuggest(false);
		setSelectedQuestion(question);
		setShowAnswer(true);
		setHasMoreAnswers(hasMoreAnswers);
		//setAnswerId((answerId) => answerId + 1);
		setChatBotAnswer(firstAnswer);
		// // salji kasnije kad klikne na Fixed
		// if (firstAnswer) {
		// 	addHistory(dbp, {
		// 		conversation: conv,
		// 		client: authUser.nickName,
		// 		questionId: question!.id!,
		// 		answerId: firstAnswer.id!,
		// 		fixed: undefined,
		// 		created: new Date()
		// 	})
		// }
	}

	const onAnswerFixed = async () => {
		const props: IChild = {
			type: ChildType.ANSWER,
			isDisabled: true,
			txt: chatBotAnswer ? chatBotAnswer.answerTitle : 'no answer title',
			link: chatBotAnswer ? chatBotAnswer.answerLink : 'no answer link',
			hasMoreAnswers: true
		}
		setPastEvents((prevHistory) => [...prevHistory, props]);

		const history: IHistory = {
			questionKey: new QuestionKey(selectedQuestion!).questionKey!,
			answerKey: chatBotAnswer!.answerKey,
			userAction: USER_ANSWER_ACTION.Fixed,
			created: {
				nickName: authUser.nickName,
				time: new Date()
			}
		}
		addHistory(history);

		//
		// TODO logic 
		//

		setHasMoreAnswers(false);
		//setAnswerId((answerId) => answerId + 1);
		setChatBotAnswer(chatBotAnswer); //undefined);
		setShowAnswer(false);
	}

	const getNextAnswer = async () => {
		// past events
		const props: IChild = {
			type: ChildType.ANSWER,
			isDisabled: true,
			txt: chatBotAnswer ? chatBotAnswer.answerTitle : 'no answer',
			link: chatBotAnswer ? chatBotAnswer.answerLink : 'no link',
			hasMoreAnswers: true
		}
		setPastEvents((prevHistory) => [...prevHistory, props]);

		// next
		//const next: INextAnswer = await (await hook).getNextChatBotAnswer();
		const next: INextAnswer = await getNextChatBotAnswer();
		const { nextChatBotAnswer, hasMoreAnswers } = next;

		if (chatBotAnswer) {
			const history: IHistory = {
				questionKey: new QuestionKey(selectedQuestion!).questionKey!,
				answerKey: chatBotAnswer.answerKey,
				userAction: nextChatBotAnswer ? USER_ANSWER_ACTION.NotFixed : USER_ANSWER_ACTION.NotClicked,
				created: {
					nickName: authUser.nickName,
					time: new Date()
				}
			}
			addHistory(history);
		}

		// salji gore
		// if (nextAnswer) {
		// 	addHistory(dbp, {
		// 		conversation,
		// 		client: authUser.nickName,
		// 		questionId: selectedQuestion!.id!,
		// 		answerId: nextAnswer.id!,
		// 		fixed: hasMoreAnswers ? undefined : false,
		// 		created: new Date()
		// 	})
		// }
		setHasMoreAnswers(hasMoreAnswers);
		//setAnswerId((answerId) => answerId + 1); PPP
		console.log('----->>>>', { nextChatBotAnswer })
		setChatBotAnswer(nextChatBotAnswer);
	}

	const QuestionComponent = (props: IChild) => {
		const { isDisabled, txt } = props;
		return (
			<Row
				className={`my-1 bg-warning text-dark mx-1 border border-1 rounded-1`}
				id={autoSuggestId.toString()}
			>
				<Col xs={0} md={3} className='mb-1'>
				</Col>
				<Col xs={12} md={9}>
					<div className="d-flex justify-content-start align-items-center">
						{/* <div className="w-75"> */}
						<img width="22" height="18" src={Q} alt="Question" className='me-1' />
						{txt}
						{/* </div> */}
					</div>
				</Col>
			</Row>
		)
	}

	const AnswerComponent = (props: IChild) => {
		const { isDisabled, txt, link } = props;
		return (
			<div
				// id={answerId.toString()}   PPP
				id={chatBotAnswer?.answerKey.id}
				className={`${isDarkMode ? "dark" : "light"} mx-6 border border-1 rounded-1`}
			>
				<Row>
					<Col xs={12} md={12} className={`${isDisabled ? 'secondary' : 'primary'} d-flex justify-content-start align-items-center`}>
						<img width="22" height="18" src={A} alt="Answer" className='m-2' />
						{/* contentEditable="true" aria-multiline="true" */}
						<div>
							{txt} <br />
							{link ? <a href={link} target="_blank" className="text-reset text-decoration-none fw-lighter fs-6" >{link}</a> : null}
						</div>
						{!isDisabled && chatBotAnswer &&
							<div>
								<Button
									size="sm"
									type="button"
									onClick={onAnswerFixed}
									disabled={!chatBotAnswer}
									className='align-middle ms-3 border border-1 rounded-1 py-0'
									variant="success"
								>
									Fixed
								</Button>
								<Button
									size="sm"
									type="button"
									onClick={getNextAnswer}
									disabled={!chatBotAnswer}
									className='align-middle ms-2 border border-1 rounded-1 py-0'
									variant="primary"
								>
									Haven't fixed
								</Button>
							</div>
						}
					</Col>
				</Row>
			</div>
		);
	};

	const AutoSuggestComponent = (props: IChild) => {
		const { isDisabled, txt } = props;
		return (
			<Row className={`my-1 ${isDarkMode ? "dark" : ""}`} key={autoSuggestId}>
				<Col xs={12} md={3} className='mb-1'>
					<label className="text-info">Please enter the Question</label>
					{/* <CatList
				parentId={'null'}
				level={1}
				setParentId={setParentId}
			/> */}
				</Col>
				<Col xs={0} md={12}>
					{isDisabled &&
						<label className="text-info">Please enter the Question</label>
					}
					<div className="d-flex justify-content-start align-items-center">
						<div className="w-75 questions">
							{isDisabled &&
								<div>
									{txt}
								</div>
							}
							{!isDisabled &&
								<>
									{/* <div>{Date.now().toString()}</div> */}
									<AutoSuggestQuestions
										tekst={txt}
										onSelectQuestion={onSelectQuestion}
										categoryRows={cats}
										searchQuestions={searchQuestions}
									/>
								</>
							}
						</div>
					</div>
				</Col>
			</Row>
		)
	}

	return (
		<Container id='container' fluid className='text-info'> {/* align-items-center" */}
			<Row className="my-1">
				<Col className='border border-secondary mx-1 bg-secondary text-white 
							d-flex align-items-center justify-content-center vh-100'>
					{/* <div className='d-inline'> */}
					Page at the Site
					{/* </div> */}
				</Col>
				<Col className='border border-4 border-primary mx-1  bg-primary text-white'>
					{/* <div className="d-inline"> */}
					<div key='Welcome'>
						<p><b>Welcome</b>, I am Buddy and I am here to help You</p>
					</div>

					<Form key='options' className='text-center border border-1 m-1 rounded-1'>
						<div className='text-center'>
							Select Options<br />
							<i className='bg-secondary'> Select 'Demo' for test </i>
						</div>
						<div className='text-center'>
							{/* <ListGroup horizontal> */}
							{catsOptions.map(({ id, title }: ICategoryRow) => (
								// <ListGroup.Item>
								<Form.Check // prettier-ignore
									id={id}
									key={id}
									label={title}
									name="opcije"
									type='checkbox'
									inline
									className=''
									onChange={onOptionChange}
								/>
								// </ListGroup.Item>
							))}
							{/* </ListGroup> */}
						</div>
					</Form>

					{showUsage &&
						<Form key="usage" className='text-center border border-1 m-1 rounded-1'>
							<div className='text-center'>
								Select services for which you need support<br />
								<i className='bg-secondary'> Select 'Usage' for test </i>
							</div>
							<div className='text-center'>
								{catsUsage.map(({ id, title }: ICategoryRow) => (
									<Form.Check // prettier-ignore
										id={id}
										label={title}
										name="usluge"
										type='checkbox'
										inline
										className=''
										onChange={onUsageChange}
									/>
								))}
							</div>
						</Form>
					}

					<div key='history' className='history'>
						{
							pastEvents.map(childProps => {
								switch (childProps.type) {
									case ChildType.AUTO_SUGGEST:
										return <AutoSuggestComponent {...childProps} />;
									case ChildType.QUESTION:
										return <QuestionComponent {...childProps} />;
									case ChildType.ANSWER:
										return <AnswerComponent {...childProps} />;
									default:
										return <div>unknown</div>
								}
							})
						}
					</div>

					{/* {selectedQuestion &&
				<div>
					<QuestionComponent type={ChildType.QUESTION} isDisabled={true} txt={selectedQuestion.title} hasMoreAnswers={hasMoreAnswers} />
				</div>
			} */}

					{showAnswer &&
						<div key="answer">
							<AnswerComponent type={ChildType.ANSWER} isDisabled={false} txt={chatBotAnswer ? chatBotAnswer.answerTitle : 'no answers'} hasMoreAnswers={hasMoreAnswers} link={chatBotAnswer ? chatBotAnswer.answerLink : ''} />
						</div>
					}

					{catsSelected && !showAutoSuggest &&
						<Button
							key="newQuestion"
							variant="secondary"
							size="sm"
							type="button"
							onClick={() => {
								setAutoSuggestId(autoSuggestId + 1);
								setShowAutoSuggest(true);
							}}
							className='m-1 border border-1 rounded-1 py-0'
						>
							New Question
						</Button>
					}

					{showAutoSuggest &&
						<AutoSuggestComponent type={ChildType.AUTO_SUGGEST} isDisabled={false} txt={autoSuggestionValue!} link={null} />
					}
					{/* </div> */}
				</Col>
			</Row>


		</Container>
	);
}

export default ChatBotPage

