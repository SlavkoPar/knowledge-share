import React from 'react';
import { useCategoryContext } from 'categories/CategoryProvider'
//import { useGlobalContext, useGlobalState } from 'global/GlobalProvider'

import QuestionForm from "categories/components/questions/QuestionForm";
import { IQuestion } from "categories/types";

const EditQuestion = ({ inLine }: { inLine: boolean }) => {
    const { state, updateQuestion } = useCategoryContext();
    const { activeQuestion } = state;  // loadingQuestion: questionLoading, 
    if (!activeQuestion)
        return null;

    //const { topId } = activeQuestion!;


    if (!activeQuestion) {
        return <div>Loading question to edit...</div>
    }

    const submitForm = async (questionObject: IQuestion) => {
        const newQuestion: IQuestion = {
            ...questionObject,
            created: undefined,
            modified: {
                time: new Date(),
                nickName: ''
            }
        }

        const { parentId } = activeQuestion;
        const categoryChanged = parentId !== newQuestion.parentId;
        //const questionKey = new QuestionKey(activeQuestion).questionKey;
        /*const question =*/ await updateQuestion(parentId!, newQuestion, categoryChanged);
        /*
        if (activeQuestion.parentId !== question.parentId) {
             await loadAndCacheAllCategoryRows(); // reload, group could have been changed
             await openNode({ topId: '', id: q.parentId, questionId: q.id });
        }
        */
        
        // if (categoryChanged) {
        //     setTimeout(() => dispatch({ type: ActionTypes.CLOSE_QUESTION_FORM, payload: { question: question } }), 1000);
        // }
    };

    return (
        <QuestionForm
            question={activeQuestion!}
            showCloseButton={true}
            source={0}
            submitForm={submitForm}
        >
            Update Question
        </QuestionForm>
    );
};

export default EditQuestion;
