import React, { useEffect, useState } from 'react'
import { Container, Row, Col, Button, Modal } from "react-bootstrap";

import { useParams } from 'react-router-dom';


import { useGlobalState } from "global/GlobalProvider";


interface IProps {
    show: boolean,
    onHide: () => void;
}

const ModalChatBot = (props: IProps) => {

    const { isDarkMode, authUser } = useGlobalState();

    // const handleClose = () => {
    //     setShowAddQuestion(false);
    // }

    useEffect(() => {
        (async () => {

        })()
    }, [])

    return (
        <Modal
            show={props.show}
            onHide={props.onHide}
            animation={false}
            centered
            size="lg"
            className="modal show right fade"
            contentClassName={`${isDarkMode ? "bg-secondary bg-gradient" : "bg-info bg-gradient"}`}
        >
            {/* <div className="modal-dialog"> */}
            <div className="modal-content">

                {/* <div className="modal-header">
                            <button type="button" className="close" data-dismiss="modal" aria-label="Close"><span aria-hidden="true">&times;</span></button>
                            <h4 className="modal-title" id="myModalLabel">Right Sidebar</h4>
                        </div> */}
                <Modal.Header closeButton>
                    <Modal.Title>Modal heading</Modal.Title>
                </Modal.Header>

                <div className="modal-body">
                    <p>Hello
                    </p>
                </div>

                <div className="modal-footer">
                    <Button variant="secondary" onClick={props.onHide}>Close</Button>
                    <Button variant="primary" onClick={props.onHide}>Save changes</Button>
                </div>

            </div>
            {/* </div> */}
            {/* <Modal.Header closeButton>
                <Modal.Title>Modal heading</Modal.Title>
            </Modal.Header>
            <Modal.Body className="py-0">
                ChatBot Component
            </Modal.Body>
            <Modal.Footer>
                <Button variant="secondary" onClick={props.onHide}>Close</Button>
                <Button variant="primary" onClick={props.onHide}>Save changes</Button>
            </Modal.Footer> */}
        </Modal>


        // <div class="modal right fade" id="myModal" tabindex="-1" role="dialog" aria-labelledby="myModalLabel">
        // 	<div class="modal-dialog">
        // 		<div class="modal-content">

        // 			<div class="modal-header">
        // 				<button type="button" class="close" data-dismiss="modal" aria-label="Close"><span aria-hidden="true">&times;</span></button>
        // 				<h4 class="modal-title" id="myModalLabel">Right Sidebar</h4>
        // 			</div>

        // 			<div class="modal-body">
        // 				<p>Hello
        // 				</p>
        // 			</div>
        // 			<div class="modal-footer">

        //     <button type="button" class="btn btn-primary">YES </button>
        //     <button type="button" class="btn btn-danger" data-dismiss="modal">Close</button>
        //   </div>

        // 		</div>
        // 	</div>
        // </div>
    )
};

export default ModalChatBot;