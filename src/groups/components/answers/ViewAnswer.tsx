import React, { useEffect, useState } from 'react';
import { useGroupContext } from 'groups/GroupProvider'
import { FormMode, IAnswer } from "groups/types";
import AnswerForm from "groups/components/answers/AnswerForm";

const ViewAnswer = ({ inLine }: { inLine: boolean }) => {
    const { state } = useGroupContext();
    const { answerLoading, groups, answerInViewingOrEditing } = state;
    //const { partitionKey, id, parentGroup } = answerInViewingOrEditing!;

    const [answer, setAnswer] = useState<IAnswer | null>(null);

     useEffect(() => {
            //const q = group!.answers.find(q => q.inEditing)
            //if (group) {
                //const q = group!.answers.find(q => q.id === id)
                console.log("#################################### ViewAnswer setAnswer ...", { answerInViewingOrEditing })
                //if (q) {
                    setAnswer(answerInViewingOrEditing);
                //}
            //}
        }, [answerInViewingOrEditing]) // answerLoading
    // if (answerLoading)
    //     return <div>Loading answer...</div>
    return (
        <AnswerForm
            answer={answer!}
            showCloseButton={true}
            source={0}
            mode={FormMode.viewing}
            submitForm={() => { }}
        >
            View Answer
        </AnswerForm>
    );
}

export default ViewAnswer;
