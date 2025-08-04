import React, { MouseEventHandler, useEffect, useState } from "react";
import { Button, ListGroup, Modal } from "react-bootstrap";
import { IAssignedAnswer, IAssignedAnswerKey, IQuestionKey } from "categories/types";
import { useCategoryContext } from "categories/CategoryProvider";
import { useGlobalContext } from "global/GlobalProvider";
import AssignedAnswer from "./AssignedAnswer";
import { AutoSuggestAnswers } from 'groups/AutoSuggestAnswers'
import { IWhoWhen } from "global/types";
import { AnswerKey, IAnswer, IAnswerKey } from "groups/types";
import { initialAnswer } from 'groups/GroupReducer'
import AddAnswer from "categories/components/questions/AddAnswer"

interface IProps {
    questionKey: IQuestionKey,
    questionTitle: string,
    assignedAnswers: IAssignedAnswer[],
    isDisabled: boolean
}

const AssignedAnswers = ({ questionKey, questionTitle, assignedAnswers, isDisabled }: IProps) => {

    const { globalState, searchAnswers, loadAndCacheAllGroupRows } = useGlobalContext();
    const { authUser, isDarkMode, variant, allGroupRows, groupRowsLoaded } = globalState;

    //const [assignedAnswers2, setAssignAnswers2] = useState<IAssignedAnswer[]>([]);

    const [showAdd, setShowAdd] = useState(false);
    const handleClose = () => setShowAdd(false);

    const closeModal = () => {
        handleClose();
    }

    const { state, assignQuestionAnswer } = useCategoryContext();
    const [showAssign, setShowAssign] = useState(false);

    const onSelectAnswer = async (assignedAnswerKey: IAssignedAnswerKey) => {
        // TODO in next version do not update MongoDB immediately, wait until users presses Save
        // User could have canceled question update
        await assignQuestionAnswer('Assign', questionKey, assignedAnswerKey);
        setShowAssign(false);
    }

    const onAnswerCreated = async (answer: IAnswer | null) => {
        if (answer) {
            await onSelectAnswer({ topId: answer.topId, id: answer.id } as IAssignedAnswerKey);
        }
        handleClose()
    }

    const unAssignAnswer = async (assignedAnswerKey: IAssignedAnswerKey) => {
        // const unAssigned: IWhoWhen = {
        //     time: new Date(),
        //     nickName: globalState.authUser.nickName
        // }
        await assignQuestionAnswer('UnAssign', questionKey, assignedAnswerKey);

        // TODO in next version do not update MongoDB immediately, wait until users presses Save
        // User could have canceled question update
        //setShowAssign(false);
    }

    const assignAnswer = async () => {
        setShowAssign(true);
    }

    useEffect(() => {
        if (!groupRowsLoaded) {
            loadAndCacheAllGroupRows();
        }
    }, [groupRowsLoaded, loadAndCacheAllGroupRows])

    return (
        <div className={'mx-0 my-0 px-1 py-1 border border-2 rounded-2 border-info bg-info'} >
            <div>
                <label className="text-muted bg-info fs-6">Assigned Answers</label>
                <ListGroup as="ul" variant={variant} className='my-1'>
                    {assignedAnswers.map((assignedAnswer: IAssignedAnswer) =>
                        <AssignedAnswer
                            key={assignedAnswer.id}
                            questionTitle={questionTitle}
                            assignedAnswer={assignedAnswer}
                            groupInAdding={false}
                            isDisabled={isDisabled}
                            unAssignAnswer={unAssignAnswer}
                        />)
                    }
                </ListGroup>
                {state.error && <div>state.error</div>}
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
                        onClick={assignAnswer} // event.preventDefault()}
                    >
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
                <Modal.Body style={{ height: '40vh', width: '50vw' }} className="answers">
                    <AutoSuggestAnswers
                        tekst={''}
                        alreadyAssigned={
                            assignedAnswers.length === 0
                                ? []
                                : assignedAnswers.map((a: IAssignedAnswer) => ({ topId: a.topId, id: a.id } as IAssignedAnswerKey))
                        }
                        allGroupRows={allGroupRows}
                        onSelectAnswer={(assignedAnswerKey: IAssignedAnswerKey) => onSelectAnswer(assignedAnswerKey)}
                        searchAnswers={searchAnswers}
                    />
                </Modal.Body>
            </Modal>
        </div >
    );
};

export default AssignedAnswers;
