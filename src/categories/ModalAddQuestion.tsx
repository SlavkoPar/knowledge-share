import React, { useEffect, useState } from 'react'
import { Container, Row, Col, Button, Modal } from "react-bootstrap";

import { useParams } from 'react-router-dom';

import { ActionTypes, IQuestion, IQuestionRow } from "./types";

import { useGlobalState } from "global/GlobalProvider";
import { CategoryProvider, useCategoryContext, useCategoryDispatch } from "./CategoryProvider";

import CategoryList from "categories/components/CategoryList";
import ViewCategory from "categories/components/ViewCategory";
import EditCategory from "categories/components/EditCategory";
import ViewQuestion from "categories/components/questions/ViewQuestion";
import EditQuestion from "categories/components/questions/EditQuestion";
import AddQuestion from './components/questions/AddQuestion';

import { initialQuestion } from "categories/CategoryReducer";

interface IProps {
    show: boolean,
    onHide: () => void;
    newQuestionRow: IQuestionRow
}

const ModalAddQuestion = (props: IProps) => {

    const { isDarkMode, authUser } = useGlobalState();

    // const handleClose = () => {
    //     setShowAddQuestion(false);
    // }

    const [createQuestionError, setCreateQuestionError] = useState("");

    const dispatch = useCategoryDispatch();

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