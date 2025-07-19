import React, { useEffect, useState } from 'react';
import { useGroupContext } from 'groups/GroupProvider'
import { FormMode, IAnswer } from "groups/types";
import AnswerForm from "groups/components/answers/AnswerForm";

const ViewAnswer = ({ inLine }: { inLine: boolean }) => {
    const { state } = useGroupContext();
    const { loadingAnswer, topRows, activeAnswer } = state;
    //const { partitionKey, id, parentId } = activeAnswer!;

    const [answer, setAnswer] = useState<IAnswer | null>(null);

    useEffect(() => {
        //const q = group!.answers.find(q => q.inEditing)
        //if (group) {
        //const q = group!.answers.find(q => q.id === id)
        console.log("#################################### ViewAnswer setAnswer ...", { activeAnswer })
        //if (q) {
        setAnswer(activeAnswer);
        //}
        //}
    }, [activeAnswer]) // answerLoading
    // if (answerLoading)
    //     return <div>Loading answer...</div>
    return (
        <AnswerForm
            answer={answer!}
            showCloseButton={true}
            source={0}
            submitForm={() => { }}
        >
            View Answer
        </AnswerForm>
    );
}

export default ViewAnswer;
