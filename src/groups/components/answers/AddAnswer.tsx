import React, { useState } from "react";
import { useGroupContext, useGroupDispatch } from 'groups/GroupProvider'
import { useGlobalState } from 'global/GlobalProvider'

import AnswerForm from "groups/components/answers/AnswerForm";
import { ActionTypes, FormMode, IAnswer, IAnswerRow } from "groups/types";
import { initialAnswer } from "groups/GroupsReducer";

interface IProps {
    answerRow: IAnswerRow;
    closeModal?: () => void;
    inLine: boolean;
    showCloseButton: boolean;
    source: number;
    setError?: (msg: string) => void;
}

const AddAnswer = ({ answerRow, inLine, closeModal, showCloseButton, source, setError }: IProps) => {
    const globalState = useGlobalState();
    const { authUser } = globalState;
    const { nickName } = authUser;

    const answer = { ...initialAnswer, ...answerRow };

    // { error, execute }

    const dispatch = useGroupDispatch();
    const { state, createAnswer, reloadGroupNode } = useGroupContext();
    if (!closeModal) {
        const cat = state.groups.find(c => c.id === answerRow.parentGroup)
        answerRow.groupTitle = cat ? cat.title : '';
    }
    
    const [formValues] = useState(answer);

    const submitForm = async (answerObject: IAnswer) => {
        const obj: any = { ...answerObject }
        delete obj.inAdding;
        // delete obj.id;
        const object: IAnswer = {
            ...obj,
            partitionKey: answer.partitionKey,
            created: {
                time: new Date(),
                nickName: nickName
            },
            modified: undefined
        }
        const q = await createAnswer(object, closeModal !== undefined);
        if (q) {
            if (q.message) {
                setError!(q.message)
            }
            else if (closeModal) {
                closeModal();
                dispatch({ type: ActionTypes.CLEAN_TREE, payload: { id: q.parentGroup } })
                await reloadGroupNode({ partitionKey: '', id: q.parentGroup, answerId: q.id });
            }
        }
    }
    return (
        <AnswerForm
            answer={formValues}
            showCloseButton={showCloseButton}
            source={source}
            closeModal={closeModal}
            mode={FormMode.adding}
            submitForm={submitForm}
        >
            Create Answer
        </AnswerForm >
    )
}

export default AddAnswer

