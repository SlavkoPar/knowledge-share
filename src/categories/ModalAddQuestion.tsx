import React, { useEffect, useState } from 'react'
import { Modal } from "react-bootstrap";


import {IQuestionRow } from "./types";

import { useGlobalState } from "global/GlobalProvider";
//import { useCategoryDispatch } from "./CategoryProvider";

import AddQuestion from './components/questions/AddQuestion';


interface IProps {
    show: boolean,
    onHide: () => void;
    newQuestionRow: IQuestionRow
}

const ModalAddQuestion = (props: IProps) => {

    const { isDarkMode } = useGlobalState();

    // const handleClose = () => {
    //     setShowAddQuestion(false);
    // }

    const [createQuestionError, setCreateQuestionError] = useState("");

    //const dispatch = useCategoryDispatch();

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
                Store new Question to the Database
            </Modal.Header>
            <Modal.Body className="py-0">
                <AddQuestion
                    closeModal={props.onHide}
                    showCloseButton={false}
                    source={1} /*gmail*/
                    setError={(msg) => setCreateQuestionError(msg)}
                />
            </Modal.Body>
            <Modal.Footer>
                {createQuestionError}
            </Modal.Footer>
        </Modal>
    );
};

export default ModalAddQuestion;