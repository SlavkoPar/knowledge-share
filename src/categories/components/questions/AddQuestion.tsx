import React from "react";
import { useCategoryContext } from 'categories/CategoryProvider'

import QuestionForm from "categories/components/questions/QuestionForm";
import { IQuestion } from "categories/types";

interface IProps {
    closeModal?: () => void;
    showCloseButton?: boolean;
    source?: number;
    setError?: (msg: string) => void;
}

const AddQuestion = ({ closeModal, showCloseButton, source, setError }: IProps) => {

    const { state, cancelAddQuestion, createQuestion } = useCategoryContext();
    const { activeQuestion } = state;
    const topId = activeQuestion
        ? activeQuestion.topId
        : '';

    if (!closeModal) {
        // const cat = state.topCategoryRows.find(c => c.id === questionRow.parentId)
        // questionRow.categoryTitle = cat ? cat.title : '';
    }

    const cancelAdd = async () => {
        await cancelAddQuestion();
    }


    const submitForm = async (questionObject: IQuestion) => {
        const newQuestion: IQuestion = {
            ...questionObject,
            topId: topId!,
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
                //dispatch({ type: ActionTypes.CLEAN_TREE, payload: { id: q.parentId } })
                //await openNode({ topId: '', id: q.parentId, questionId: q.id });
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


