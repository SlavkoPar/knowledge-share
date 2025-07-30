import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faCopy, faEnvelope, faRemove } from '@fortawesome/free-solid-svg-icons'

import { ListGroup, Button, Modal } from "react-bootstrap";

import { useGlobalState } from 'global/GlobalProvider'
import { useHover } from 'hooks/useHover';
import { useCategoryContext } from "categories/CategoryProvider";
import { formatDate } from 'common/utilities'
import React, { useState } from "react";
import { IAnswer, IAnswerKey } from 'groups/types';
import { IAssignedAnswer } from 'categories/types';

interface IProps {
    questionTitle: string,
    assignedAnswer: IAssignedAnswer,
    groupInAdding: boolean | undefined,
    isDisabled: boolean,
    unAssignAnswer: (assignedAnswer: IAssignedAnswer) => void
}
const AssignedAnswer = ({ questionTitle, assignedAnswer, isDisabled, unAssignAnswer }: IProps) => {

    const { topId, id, answerTitle, created } = assignedAnswer;

    const { time, nickName } = created!;
    const emailFromClient = localStorage.getItem('emailFromClient');

    const rowTitle = `Created by: ${nickName}, ${formatDate(new Date(time))}`

    const { authUser, canEdit, isDarkMode, variant, bg } = useGlobalState();

    //const { nickName, email } = authUser;

    const { state } = useCategoryContext();

    const alreadyAdding = false;

    const removeAnswer = () => {
        unAssignAnswer(assignedAnswer)
    };

    const edit = (id: number) => {
        // Load data from server and reinitialize answer
        //editAnswer(id);
    }

    const onSelectAnswer = (id: string) => {
        // Load data from server and reinitialize answer
        //viewAnswer(id);
    }

    const sendEMail = () => {

        /*
        const values = {
            wsName,
            from_name: userName,
            to_name: emailFromClient,
            questionTitle,
            answer: title,
            email_from: email,
            email_to: emailFromClient,
            contact_number: 0
        }
        values.contact_number = Math.random() * 100000 | 0;
        */

        // emailjs.send('service_akla4ca', 'template_2nbaqbj', values, 'YeDIRPwve3mgTemkA')
        //     .then(function () {
        //         console.log('SUCCESS!');
        //         handleClose();
        //     }, function (error) {
        //         console.log('FAILED...', error);
        //         //closeForm();
        //     });
    }

    const [showReply, setShowReply] = useState(false);
    const handleClose = () => setShowReply(false);

    const copyToClipboard = (answerTitle: string): void => {
        if (navigator.clipboard) {
            navigator.clipboard.writeText(answerTitle) // input!.value)
                .then(() => {
                    console.log('Copied to clipboard successfully.');
                    alert('Answer copied to clipboard');
                }, (err) => {
                    console.log('Failed to copy the text to clipboard.', err);
                });
        }
    }

    const [hoverRef, hoverProps] = useHover();

    const Row1 =
        <div ref={hoverRef} className="d-flex justify-content-start align-items-center w-100 text-light bg-info">
            <Button
                variant='link'
                size="sm"
                className="py-0 px-0 text-info"
                onClick={() => emailFromClient ? setShowReply(true) : copyToClipboard(answerTitle!)}
            >
                <FontAwesomeIcon
                    icon={emailFromClient ? faEnvelope : faCopy}
                    size='sm'
                    title='Send this Answer in a reply on Question'
                />
            </Button>
            <Button
                variant='link'
                size="sm"
                className="py-0 mx-1 text-decoration-none text-white text-wrap"
                title={rowTitle}
                onClick={() => onSelectAnswer(id)}
                disabled={alreadyAdding}
            >
                {answerTitle}
            </Button>

            {canEdit && !alreadyAdding && hoverProps.isHovered && !isDisabled &&
                <Button variant='link' size="sm" className="ms-1 py-0 mx-1 text-secondary"
                    onClick={removeAnswer}
                >
                    <FontAwesomeIcon icon={faRemove} size='lg' />
                </Button>
            }
        </div>

    return (
        <ListGroup.Item
            key={id}
            variant={"info"}
            className="py-0 px-0"
            as="li"
        >
            {/* <div class="d-lg-none">hide on lg and wider screens</div> */}
            {Row1}

            <Modal
                show={showReply}
                onHide={handleClose}
                animation={true}
                centered
                size="lg"
                className={`${isDarkMode ? "bg" : ""}`}
                contentClassName={`${isDarkMode ? "bg-info bg-gradient" : ""}`}
            >
                <Modal.Header closeButton>
                    Send Answer in a reply on Question
                </Modal.Header>
                <Modal.Body className="py-0">
                    <table className="table-info table-hover table-bordered w-100 h-100">
                        <tbody>
                            <tr className="border-top-0"><td>To:</td><td>{emailFromClient}</td></tr>
                            <tr><td>Subject:</td><td>{questionTitle}</td></tr>
                            <tr className="border-bottom-0"><td>Body:</td><td>{answerTitle}</td></tr>
                        </tbody>
                    </table>
                </Modal.Body>
                <Modal.Footer>
                    <Button variant="secondary" size="sm" onClick={handleClose}>Cancel</Button>
                    <Button variant="primary" size="sm" onClick={sendEMail}>Send E-Mail</Button>
                </Modal.Footer>
            </Modal>

        </ListGroup.Item>

    );
};

export default AssignedAnswer;
