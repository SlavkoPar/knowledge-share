import React, { useEffect, useState } from 'react';
import { useCategoryContext } from 'categories/CategoryProvider'
import { IQuestion } from "categories/types";
import QuestionForm from "categories/components/questions/QuestionForm";

const ViewQuestion = ({ inLine }: { inLine: boolean }) => {
    const { state } = useCategoryContext();
    const { activeQuestion } = state;
    //const { topId, id, parentId } = activeQuestion!;

    const [question, setQuestion] = useState<IQuestion | null>(null);

    useEffect(() => {
        //const q = category!.questions.find(q => q.inEditing)
        //if (category) {
        //const q = category!.questions.find(q => q.id === id)
        console.log("#################################### ViewQuestion setQuestion ...", { activeQuestion })
        //if (q) {
        setQuestion(activeQuestion);
        //}
        //}
    }, [activeQuestion]) // questionLoading
    // if (questionLoading)
    //     return <div>Loading question...</div>
    return (
        <QuestionForm
            question={question!}
            showCloseButton={true}
            source={0}
            submitForm={() => { }}
        >
            View Question
        </QuestionForm>
    );
}

export default ViewQuestion;
