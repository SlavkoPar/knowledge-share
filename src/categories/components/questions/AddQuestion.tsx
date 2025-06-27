import React, { useState } from "react";
import { useCategoryContext, useCategoryDispatch } from 'categories/CategoryProvider'
import { useGlobalState } from 'global/GlobalProvider'

import QuestionForm from "categories/components/questions/QuestionForm";
import { ActionTypes, FormMode, IQuestion, IQuestionRow } from "categories/types";
import { initialQuestion } from "categories/CategoryReducer";

interface IProps {
    closeModal?: () => void;
    showCloseButton?: boolean;
    source?: number;
    setError?: (msg: string) => void;
}

const AddQuestion = ({ closeModal, showCloseButton, source, setError }: IProps) => {

    const { state, cancelAddQuestion, createQuestion } = useCategoryContext();
    const { activeQuestion } = state;
    const rootId = activeQuestion
        ? activeQuestion.rootId
        : '';

    if (!closeModal) {
        // const cat = state.topCategoryRows.find(c => c.id === questionRow.parentCategory)
        // questionRow.categoryTitle = cat ? cat.title : '';
    }

    const cancelAdd = async () => {
        await cancelAddQuestion();
    }
    
    
    const submitForm = async (questionObject: IQuestion) => {
        const newQuestion: IQuestion = {
            ...questionObject,
            rootId: rootId!,
            created: {
                time: new Date(),
                nickName: ''
            },
            modified: undefined
        }
        const q = await createQuestion(newQuestion, closeModal !== undefined);
        if (q) {
            if (q.message) {
                setError!(q.message)
            }
            else if (closeModal) {
                closeModal();
                //dispatch({ type: ActionTypes.CLEAN_TREE, payload: { id: q.parentCategory } })
                //await openCategoryNode({ partitionKey: '', id: q.parentCategory, questionId: q.id });
            }
        }
    }

    if (!activeQuestion)
        return null;

    // activeQuestion.title += odakle
    return (
        <QuestionForm
            question={activeQuestion!}
            showCloseButton={showCloseButton ?? true}
            source={source ?? 0}
            closeModal={cancelAdd}
            //formMode={FormMode.AddingQuestion}
            submitForm={submitForm}
        >
            Create Question
        </QuestionForm >
    )
}

export default AddQuestion


