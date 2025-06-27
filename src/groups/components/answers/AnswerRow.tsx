import React, { useEffect } from 'react';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faEdit, faRemove, faThumbsUp, faPlus, faReply } from '@fortawesome/free-solid-svg-icons'

import { ListGroup, Button, Badge } from "react-bootstrap";

import { useGlobalState } from 'global/GlobalProvider'
import { ActionTypes, IGroupInfo, IAnswerKey, IAnswerRow, Mode } from "groups/types";
import { useGroupContext, useGroupDispatch } from 'groups/GroupProvider'
import { useHover } from 'hooks/useHover';
import { IAnswer } from 'groups/types'

import AddAnswer from "groups/components/answers/AddAnswer";
import EditAnswer from "groups/components/answers/EditAnswer";
import ViewAnswer from "groups/components/answers/ViewAnswer";
import Q from 'assets/Q.png';
import QPlus from 'assets/QPlus.png';

import { IWhoWhen } from 'global/types';
import { initialAnswer } from 'groups/GroupsReducer';


//const AnswerRow = ({ answer, groupInAdding }: { ref: React.ForwardedRef<HTMLLIElement>, answer: IAnswer, groupInAdding: boolean | undefined }) => {
const AnswerRow = ({ answerRow, groupInAdding }: { answerRow: IAnswerRow, groupInAdding: boolean | undefined }) => {
    const { id, partitionKey, parentGroup, title, isSelected } = answerRow;
    const answerKey: IAnswerKey = { partitionKey, id, parentGroup: parentGroup ?? undefined };

    const { canEdit, isDarkMode, variant, bg, authUser } = useGlobalState();
    const { state, viewAnswer, editAnswer, deleteAnswer } = useGroupContext();
    const dispatch = useGroupDispatch();

    const { answerInViewingOrEditing, groupKeyExpanded } = state;
    const { answerId } = groupKeyExpanded ?? { answerId: null };

    //const { answerKey } = answerInViewingOrEditing;
    //const bold = answerInViewingOrEditing && answerInViewingOrEditing.id === id;
    //const bold = groupKeyExpanded && groupKeyExpanded.id === id;
    //const bold = included; // id === answerId;
    console.log("------------------------ AnswerRow", { id, answerId })

    const alreadyAdding = state.mode === Mode.AddingAnswer;

    const del = () => {
        answerRow.modified = {
            time: new Date(),
            nickName: authUser.nickName
        }
        deleteAnswer(answerRow);
    };

    const edit = async (Id: string) => {
        // Load data from server and reinitialize answer
        await editAnswer(answerKey);
    }

    const onSelectAnswer = async (id: string) => {
        if (canEdit)
            await editAnswer(answerKey);
        else
            await viewAnswer(answerKey);
    }

    useEffect(() => {
        (async () => {
            if (isSelected) {
                onSelectAnswer(id)
            }
        })()
    }, [isSelected]);

    const [hoverRef, hoverProps] = useHover();

    const Row1 =
        <div ref={hoverRef} className="d-flex justify-content-start align-items-center w-100 text-white bg-info position-relative answer-row">
            <Button
                variant='link'
                size="sm"
                className="d-flex align-items-center px-1 text-white"
            >
                <img width="22" height="18" src={Q} alt="Answer" />
            </Button>
            <Button
                variant='link'
                size="sm"
                className={`p-0 mx-0 text-decoration-none text-white ${isSelected ? 'fw-bold' : ''}`}
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
                            dispatch({ type: ActionTypes.ADD_ANSWER, payload: { groupInfo } })
                        }}
                    >
                        <img width="22" height="18" src={QPlus} alt="Add Answer" />
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
            {/*inAdding &&*/ groupInAdding && state.mode === Mode.AddingAnswer ? (
                <AddAnswer
                    //answer={{ ...initialAnswer, ...answerRow}} 
                    answerRow={answerRow}
                    inLine={true}
                    showCloseButton={true}
                    source={0} />
            )
                : (state.mode === Mode.EditingAnswer || state.mode === Mode.ViewingAnswer) ? (
                    <>
                        {/* <div class="d-lg-none">hide on lg and wider screens</div> */}
                        <div id='div-answer' className="ms-0 d-md-none w-100">
                            {state.mode === Mode.EditingAnswer && <EditAnswer answerKey={answerKey} inLine={true} />}
                            {state.mode === Mode.ViewingAnswer && <ViewAnswer inLine={true} />}
                        </div>
                        <div className="d-none d-md-block">
                            {Row1}
                        </div>
                    </>
                )
                    : (
                        Row1
                    )
            }
            {/* </div> */}
        </ListGroup.Item>
    );
};

export default AnswerRow;
