import React, { useEffect, useState } from 'react';
import { useCategoryContext, useCategoryDispatch } from 'categories/CategoryProvider'
import { useGlobalContext, useGlobalState } from 'global/GlobalProvider'

import QuestionForm from "categories/components/questions/QuestionForm";
import { ActionTypes, FormMode, IQuestion, IQuestionKey, QuestionKey } from "categories/types";

const EditQuestion = ({ inLine }: { inLine: boolean }) => {
    const { state, updateQuestion } = useCategoryContext();
    const { loadingQuestion: questionLoading, activeQuestion } = state;
    if (!activeQuestion)
        return null;

    const { topId } = activeQuestion!;

    console.log("#################################### EditQuestion inLine:", { inLine }, { activeQuestion })

    if (!activeQuestion) {
        console.log("#################################### EditQuestion loading ...")
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
        const question = await updateQuestion(parentId!, newQuestion, categoryChanged);
        if (activeQuestion.parentId !== question.parentId) {
            /*
             await loadAndCacheAllCategoryRows(); // reload, group could have been changed
             await openNode({ topId: '', id: q.parentId, questionId: q.id });
            */
        }
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
