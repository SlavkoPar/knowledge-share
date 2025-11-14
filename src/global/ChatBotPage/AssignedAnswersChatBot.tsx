import React, { useEffect, useState } from "react";
import { Button, ListGroup, Modal } from "react-bootstrap";
import { useGlobalContext } from "global/GlobalProvider";
import AssignedAnswerChatBot from "global/ChatBotPage/AssignedAnswerChatBot";
import { AutoSuggestAnswers } from 'groups/AutoSuggestAnswers'
import { IWhoWhen } from "global/types";
import { IAnswer, IAnswerKey } from "groups/types";
import { initialAnswer } from "groups/GroupReducer";
import AddAnswer from "categories/components/questions/AddAnswer"
import { IAssignedAnswer } from "categories/types";

interface IProps {
    questionId: number,
    questionTitle: string,
    assignedAnswers: IAssignedAnswer[],
    isDisabled: boolean
}

const AssignedAnswersChatBot = ({ questionId, questionTitle, assignedAnswers, isDisabled }: IProps) => {

    //const { state, assignQuestionAnswer, unAssignQuestionAnswer } = useCategoryContext();
    const { globalState } = useGlobalContext();
    const { authUser, isDarkMode, variant, dbp, error } = globalState;

    const [showAdd, setShowAdd] = useState(false);
    const handleClose = () => setShowAdd(false);

    const closeModal = () => {
        handleClose();
    }

    //const [assignedAnswers2, setAssignAnswers2] = useState<IAssignedAnswer[]>([]);

    const [showAssign, setShowAssign] = useState(false);

    const onSelectQuestionAnswer = async (answerKey: IAnswerKey) => {
        const assigned: IWhoWhen = {
            time: new Date(),
            nickName: globalState.authUser.nickName
        }
        // TODO in next version do not update MongoDB immediately, wait until users presses Save
        // User could have canceled question update
        // await assignQuestionAnswer(questionId, answerId, assigned);
        setShowAssign(false);
    }

    const onAnswerCreated = async (answer: IAnswer | null) => {
        if (answer) {
            const { topId, id, parentId } = answer;
            const answerKey = { topId, id, parentId }
            await onSelectQuestionAnswer(answerKey);
        }
        handleClose()
    }

    const unAssignAnswer = async (answerKey: IAnswerKey) => {
        //await unAssignQuestionAnswer(questionId, answerId);
    }

    // useEffect(() => {
    //     (async () => {
    //         if (assignedAnswers.length > 0) {
    //             const arr = await joinAssignedAnswers(assignedAnswers);
    //             setAssignAnswers2(arr);
    //         }
    //     })()
    // }, [])

    return (
        <div className={'mx-0 my-1 border rounded-2 px-3 py-1 border border-info'} >
            <div>
                <label className="text-info">Assigned Answers</label>
                <ListGroup as="ul" variant={variant} className='my-1'>
                    {assignedAnswers.map((assignedAnswer: IAssignedAnswer) =>
                        <AssignedAnswerChatBot
                            questionTitle={questionTitle}
                            assignedAnswer={assignedAnswer}
                            groupInAdding={false}
                            isDisabled={isDisabled}
                            unAssignAnswer={unAssignAnswer}
                        />
                        // POPRAVI key={assignedAnswer.answer.id.toString()}
                    )}
                </ListGroup>
                {error && <div>error</div>}
                {/* {state.loading && <div>...loading</div>} */}
            </div>
            {true && // we expect no question will ever assign all the answers from the database
                <div className="d-flex justify-content-start w-100 align-items-center py-1">
                    <Button
                        size="sm"
                        className="button-edit py-0 rounded-1"
                        title="Assign a new Answer"
                        style={{ border: '1px solid silver', fontSize: '12px' }}
                        variant={variant}
                        disabled={isDisabled}
                        onClick={
                            (e) => {
                                setShowAssign(true);
                                e.preventDefault()
                            }
                        }>
                        Assign answer
                    </Button>
                    <Button
                        size="sm"
                        className="button-edit py-0 rounded-1 mx-1"
                        title="Add and Assign a new Answer"
                        style={{ border: '1px solid silver', fontSize: '12px' }}
                        variant={variant}
                        disabled={isDisabled}
                        onClick={
                            (e) => {
                                setShowAdd(true);
                                e.preventDefault()
                            }
                        }>
                        Add a new answer
                    </Button>
                </div>
            }

            <Modal
                show={showAdd}
                onHide={handleClose}
                animation={true}
                centered
                size="lg"
                className={`${isDarkMode ? "" : ""}`}
                contentClassName={`${isDarkMode ? "bg-info bg-gradient" : ""}`}
            >
                <Modal.Header closeButton>
                    <Modal.Title>{questionTitle}</Modal.Title>
                </Modal.Header>
                <Modal.Body>
                    <AddAnswer
                        inLine={true}
                        closeModal={closeModal}
                        onAnswerCreated={onAnswerCreated}
                    />
                </Modal.Body>
            </Modal>

            <Modal
                show={showAssign}
                onHide={() => setShowAssign(false)}
                animation={true}
                size="lg"
                centered
                className={`${isDarkMode ? "dark" : ""}`}
                contentClassName={`${isDarkMode ? "dark" : ""}`}>
                <Modal.Header closeButton>
                    <Modal.Title>Assign the answer</Modal.Title>
                </Modal.Header>
                <Modal.Body style={{ height: '40vh', width: '50vw' }} className="question-answers">

                    {/* <AutoSuggestAnswers
                            questionKey={questionKey}
                            tekst={''}
                            allGroupRows={allGroupRows}
                            onSelectAnswer={(assignedAnswerKey: IAssignedAnswerKey) => onSelectAnswer(assignedAnswerKey)}
                            searchAnswers={searchAnswers}
                        /> */}
                </Modal.Body>
            </Modal>
        </div>
    );
};

export default AssignedAnswersChatBot;
