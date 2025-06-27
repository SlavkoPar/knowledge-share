import React, { useEffect, useState } from 'react'
import { Container, Row, Col, Button, Modal } from "react-bootstrap";

import { useParams } from 'react-router-dom';

import { Mode, ActionTypes, IAnswer, IAnswerRow } from "./types";

import { useGlobalState } from "global/GlobalProvider";
import { GroupProvider, useGroupContext, useGroupDispatch } from "./GroupProvider";

import GroupList from "groups/components/GroupList";
import ViewGroup from "groups/components/ViewGroup";
import EditGroup from "groups/components/EditGroup";
import ViewAnswer from "groups/components/answers/ViewAnswer";
import EditAnswer from "groups/components/answers/EditAnswer";
import AddAnswer from './components/answers/AddAnswer';

import { initialAnswer } from "groups/GroupsReducer";

interface IProps {
    show: boolean,
    onHide: () => void;
    newAnswerRow: IAnswerRow
}

const ModalAddAnswer = (props: IProps) => {

    const { isDarkMode, authUser } = useGlobalState();

    // const handleClose = () => {
    //     setShowAddAnswer(false);
    // }

    const [createAnswerError, setCreateAnswerError] = useState("");

    const dispatch = useGroupDispatch();

    useEffect(() => {
        (async () => {

        })()
    }, [])

    return (
        <Modal
            show={props.show}
            onHide={props.onHide}
            animation={true}
            centered
            size="lg"
            className="modal show"
            contentClassName={`${isDarkMode ? "bg-secondary bg-gradient" : "bg-info bg-gradient"}`}
        >
            <Modal.Header closeButton>
                Store new Answer to the Database
            </Modal.Header>
            <Modal.Body className="py-0">
                <AddAnswer
                    answerRow={props.newAnswerRow}
                    closeModal={props.onHide}
                    inLine={true}
                    showCloseButton={false}
                    source={1} /*gmail*/
                    setError={(msg) => setCreateAnswerError(msg)}
                />
            </Modal.Body>
            <Modal.Footer>
                {createAnswerError}
            </Modal.Footer>
        </Modal>
    );
};

export default ModalAddAnswer;