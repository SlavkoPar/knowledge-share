import React, { useEffect, useState } from 'react';
import { useGroupContext, useGroupDispatch } from 'groups/GroupProvider'
import { useGlobalContext, useGlobalState } from 'global/GlobalProvider'

import AnswerForm from "groups/components/answers/AnswerForm";
import { ActionTypes, FormMode, IAnswer, IAnswerKey, AnswerKey } from "groups/types";

const EditAnswer = ({ inLine }: { inLine: boolean }) => {
    const { state, updateAnswer } = useGroupContext();
    const { loadingAnswer, activeAnswer } = state;
    if (!activeAnswer)
        return null;

    const { rootId } = activeAnswer!;

    console.log("#################################### EditAnswer inLine:", { inLine }, { activeAnswer })

    if (!activeAnswer) {
        console.log("#################################### EditAnswer loading ...")
        return <div>Loading answer to edit...</div>
    }

    const submitForm = async (answerObject: IAnswer) => {
        const newAnswer: IAnswer = {
            ...answerObject,
            created: undefined,
            modified: {
                time: new Date(),
                nickName: ''
            }
        }

        const { parentId } = activeAnswer;
        const groupChanged = parentId !== newAnswer.parentId;
        //const answerKey = new AnswerKey(activeAnswer).answerKey;
        const answer = await updateAnswer(rootId!, parentId!, newAnswer, groupChanged);
        if (activeAnswer.parentId !== answer.parentId) {
            /*
             await loadAndCacheAllGroupRows(); // reload, group could have been changed
             await openNode({ partitionKey: '', id: q.parentId, answerId: q.id });
            */
        }
        // if (groupChanged) {
        //     setTimeout(() => dispatch({ type: ActionTypes.CLOSE_ANSWER_FORM, payload: { answer: answer } }), 1000);
        // }
    };

    return (
        <AnswerForm
            answer={activeAnswer!}
            showCloseButton={true}
            source={0}
            submitForm={submitForm}
        >
            Update Answer
        </AnswerForm>
    );
};

export default EditAnswer;
