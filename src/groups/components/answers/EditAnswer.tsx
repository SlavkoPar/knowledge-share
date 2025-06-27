import React, { useEffect, useState } from 'react';
import { useGroupContext, useGroupDispatch } from 'groups/GroupProvider'
import { useGlobalContext, useGlobalState } from 'global/GlobalProvider'

import AnswerForm from "groups/components/answers/AnswerForm";
import { ActionTypes, FormMode, IAnswer, IAnswerKey } from "groups/types";

const EditAnswer = ({ answerKey, inLine }: { answerKey: IAnswerKey, inLine: boolean }) => {
    const { partitionKey, id, parentGroup } = answerKey;
    const globalState = useGlobalState();
    const { nickName } = globalState.authUser;
    const { loadAndCacheAllCategoryRows } = useGlobalContext();

    const dispatch = useGroupDispatch();
    const { state, updateAnswer, reloadGroupNode } = useGroupContext();
    const { answerLoading, groups, answerInViewingOrEditing } = state;
    //const { partitionKey, id, parentGroup } = answerInViewingOrEditing!;
    //const group = groups.find(c => c.id === parentGroup);
    const [answer, setAnswer] = useState<IAnswer | null>(null);
    useEffect(() => {
        //const q = group!.answers.find(q => q.inEditing)
        //if (group) {
        //const q = group!.answers.find(q => q.id === id)
        console.log("#################################### EditAnswer setAnswer ...", { answerInViewingOrEditing })
        //if (q) {
        setAnswer(answerInViewingOrEditing);
        //}
        //}
    }, [answerInViewingOrEditing]) // answerLoading

    // if (answerLoading) {
    //     console.log("#################################### EditAnswer loading ...")
    //     return <div>Loading answer..</div>
    // }

    console.log("#################################### EditAnswer inLine:", { inLine }, { answer })

    if (!answerInViewingOrEditing) {
        console.log("#################################### EditAnswer loading ...")
        return <div>Loading answer..</div>
    }

    const submitForm = async (answerObject: IAnswer) => {
        const object: IAnswer = {
            ...answerObject,
            created: undefined,
            modified: {
                time: new Date(),
                nickName: nickName
            }
        }
        const groupChanged = answer!.parentGroup !== object.parentGroup;
        const a = await updateAnswer(object, groupChanged);
        if (answer!.parentGroup !== a.parentGroup) {
            await loadAndCacheAllCategoryRows(); // reload, group could have been changed
            dispatch({ type: ActionTypes.CLEAN_TREE, payload: { id: a.parentGroup } })
            await reloadGroupNode({ partitionKey: '', id: a.parentGroup, answerId: a.id });
        }
        if (groupChanged) {
            setTimeout(() => dispatch({ type: ActionTypes.CLOSE_ANSWER_FORM, payload: { answer: a } }), 1000);
        }
    };

    if (!answer)
        return null;

    return (
        <AnswerForm
            answer={answer!}
            showCloseButton={true}
            source={0}
            mode={FormMode.editing}
            submitForm={submitForm}
        >
            Update Answer
        </AnswerForm>
    );
};

export default EditAnswer;
