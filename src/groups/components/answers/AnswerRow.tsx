import React, { useEffect, useState } from 'react';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faEdit, faRemove, faThumbsUp, faPlus, faReply } from '@fortawesome/free-solid-svg-icons'

import { ListGroup, Button, Badge } from "react-bootstrap";

import { useGlobalState } from 'global/GlobalProvider'
import { ActionTypes, FormMode, IGroupInfo, IGroupKey, IAnswerKey, IAnswerRow } from "groups/types";
import { useGroupContext, useGroupDispatch } from 'groups/GroupProvider'
import { useHover } from 'hooks/useHover';
import { IAnswer } from 'groups/types'

import AddAnswer from "groups/components/answers/AddAnswer";
import EditAnswer from "groups/components/answers/EditAnswer";
import ViewAnswer from "groups/components/answers/ViewAnswer";
import A from 'assets/A.png';
import APlus from 'assets/APlus.png';

import { IWhoWhen } from 'global/types';
import { initialAnswer } from 'groups/GroupReducer';


//const AnswerRow = ({ answer, groupInAdding }: { ref: React.ForwardedRef<HTMLLIElement>, answer: IAnswer, groupInAdding: boolean | undefined }) => {
const AnswerRow = ({ answerRow }: { answerRow: IAnswerRow }) => {
    const { id, partitionKey, parentGroup, title, isSelected, rootId } = answerRow;
    const answerKey: IAnswerKey = { partitionKey, id, parentGroup: parentGroup ?? undefined };
    const groupKey: IGroupKey = { partitionKey, id: parentGroup }

    const { canEdit, isDarkMode, variant, bg, authUser } = useGlobalState();
    const { state, viewAnswer, addAnswer, editAnswer, deleteAnswer } = useGroupContext();

    const { activeAnswer, formMode, keyExpanded: groupKeyExpanded } = state;

    const showForm = activeAnswer !== null && activeAnswer.id === id;

    //const [alreadyAdding] = useState(formMode === FormMode.AddingAnswer);
    const alreadyAdding = formMode === FormMode.AddingAnswer;

    const del = () => {
        answerRow.modified = {
            time: new Date(),
            nickName: authUser.nickName
        }
        deleteAnswer(answerRow);
    };

    const edit = async (Id: string) => {
        // Load data from server and reinitialize answer
        await editAnswer(answerRow);
    }

    const onSelectAnswer = async (id: string) => {
        if (canEdit)
            await editAnswer(answerRow);
        else
            await viewAnswer(answerRow);
    }

    useEffect(() => {
        (async () => {
            if (isSelected) {
                switch (formMode) {
                    case FormMode.ViewingAnswer:
                        await viewAnswer(answerRow);
                        break;
                    case FormMode.EditingAnswer:
                        canEdit
                            ? await editAnswer(answerRow)
                            : await viewAnswer(answerRow);
                        break;
                }
            }
        })()
    }, [isSelected]);

    const [hoverRef, hoverProps] = useHover();

    const Row1 =
        <div ref={hoverRef} className="d-flex justify-content-start align-items-center w-100 text-primary answer-row position-relative answer-row">
            <Button
                variant='link'
                size="sm"
                className="d-flex align-items-center px-1 text-secondary"
            >
                <img width="22" height="18" src={A} alt="Answer" />
            </Button>
            <Button
                variant='link'
                size="sm"
                className={`p-0 mx-0 text-decoration-none text-secondary ${showForm ? 'fw-bold' : ''}`}
                title={`id:${id!.toString()}`}
                onClick={() => onSelectAnswer(id!)}
                disabled={alreadyAdding}
            >
                {title}
            </Button>


            {/* {canEdit && !alreadyAdding && hoverProps.isHovered &&
                <Button variant='link' size="sm" className="ms-1 py-0 px-1 text-secondary"
                    //onClick={() => { dispatch({ type: ActionTypes.EDIT, answer }) }}>
                    onClick={() => edit(_id!)}
                >
                    <FontAwesomeIcon icon={faEdit} size='lg' />
                </Button>
            } */}

            {canEdit && !alreadyAdding && hoverProps.isHovered &&
                <div className="position-absolute d-flex align-items-center top-0 end-0">
                    <Button variant='link' size="sm" className="ms-0 p-0 text-secondary"
                        onClick={del}
                    >
                        <FontAwesomeIcon icon={faRemove} size='lg' />
                    </Button>
                    <Button
                        variant='link'
                        size="sm"
                        className="ms-1 p-0 text-secondary d-flex align-items-center"
                        title="Add Answer"
                        onClick={() => {
                            const groupInfo: IGroupInfo = { groupKey: { partitionKey, id: parentGroup }, level: 0 }
                            addAnswer(groupKey, rootId!);
                        }}
                    >
                        <img width="22" height="18" src={APlus} alt="Add Answer" />
                    </Button>
                </div>
            }
        </div>

    return (
        // border border-3 border-danger"
        // <div className="py-0 px-0 w-100 list-group-item border">
        <ListGroup.Item
            variant={"primary"}
            className="py-0 px-1 w-100"
            as="li"
        >
            {showForm && formMode === FormMode.AddingAnswer &&
                <>
                    <div id='div-answer' className="ms-0 d-md-none w-100">
                        <AddAnswer
                            showCloseButton={true}
                            source={0} />
                    </div>
                    <div className="d-none d-md-block">
                        {Row1}
                    </div>
                </>
            }

            {showForm && formMode === FormMode.EditingAnswer &&
                <>
                    {/* <div class="d-lg-none">hide on lg and wider screens</div> */}
                    <div id='div-answer' className="ms-0 d-md-none w-100">
                        <EditAnswer inLine={true} />
                    </div>
                    <div className="d-none d-md-block">
                        {Row1}
                    </div>
                </>
            }

            {showForm && formMode === FormMode.ViewingAnswer &&
                <>
                    {/* <div class="d-lg-none">hide on lg and wider screens</div> */}
                    <div id='div-answer' className="ms-0 d-md-none w-100">
                        <ViewAnswer inLine={true} />
                    </div>
                    <div className="d-none d-md-block">
                        {Row1}
                    </div>
                </>
            }

            {!showForm &&
                <div className="d-none d-md-block">
                    {Row1}
                </div>
            }

        </ListGroup.Item>
    );
};

export default AnswerRow;
