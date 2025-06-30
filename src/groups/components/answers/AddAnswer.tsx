import React, { useState } from "react";
import { useGroupContext, useGroupDispatch } from 'groups/GroupProvider'
import { useGlobalState } from 'global/GlobalProvider'

import AnswerForm from "groups/components/answers/AnswerForm";
import { ActionTypes, FormMode, IAnswer, IAnswerRow } from "groups/types";
import { initialAnswer } from "groups/GroupReducer";

interface IProps {
    closeModal?: () => void;
    showCloseButton?: boolean;
    source?: number;
    setError?: (msg: string) => void;
}

const AddAnswer = ({ closeModal, showCloseButton, source, setError }: IProps) => {

    const { state, cancelAddAnswer, createAnswer } = useGroupContext();
    const { activeAnswer } = state;
    const rootId = activeAnswer
        ? activeAnswer.rootId
        : '';

    if (!closeModal) {
        // const cat = state.topGroupRows.find(c => c.id === answerRow.parentGroup)
        // answerRow.groupTitle = cat ? cat.title : '';
    }

    const cancelAdd = async () => {
        await cancelAddAnswer();
    }
    
    
    const submitForm = async (answerObject: IAnswer) => {
        const newAnswer: IAnswer = {
            ...answerObject,
            rootId: rootId!,
            created: {
                time: new Date(),
                nickName: ''
            },
            modified: undefined
        }
        const q = await createAnswer(newAnswer, closeModal !== undefined);
        if (q) {
            if (q.message) {
                setError!(q.message)
            }
            else if (closeModal) {
                closeModal();
                //dispatch({ type: ActionTypes.CLEAN_TREE, payload: { id: q.parentGroup } })
                //await openGroupNode({ partitionKey: '', id: q.parentGroup, answerId: q.id });
            }
        }
    }

    if (!activeAnswer)
        return null;

    // activeAnswer.title += odakle
    return (
        <AnswerForm
            answer={activeAnswer!}
            showCloseButton={showCloseButton ?? true}
            source={source ?? 0}
            closeModal={cancelAdd}
            //formMode={FormMode.AddingAnswer}
            submitForm={submitForm}
        >
            Create Answer
        </AnswerForm >
    )
}

export default AddAnswer


