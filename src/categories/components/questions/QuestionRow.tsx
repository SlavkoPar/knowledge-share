import React, { useEffect } from 'react';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faRemove } from '@fortawesome/free-solid-svg-icons'

import { ListGroup, Button, Badge } from "react-bootstrap";

import { useGlobalState } from 'global/GlobalProvider'
import { FormMode, ICategoryKey, IQuestionRow } from "categories/types";
import { useCategoryContext } from 'categories/CategoryProvider'
import { useHover } from 'hooks/useHover';

import AddQuestion from "categories/components/questions/AddQuestion";
import EditQuestion from "categories/components/questions/EditQuestion";
import ViewQuestion from "categories/components/questions/ViewQuestion";
import Q from 'assets/Q.png';
import QPlus from 'assets/QPlus.png';


//const QuestionRow = ({ question, categoryInAdding }: { ref: React.ForwardedRef<HTMLLIElement>, question: IQuestion, categoryInAdding: boolean | undefined }) => {
const QuestionRow = ({ questionRow }: { questionRow: IQuestionRow }) => {
    const { id, topId, parentId, title, numOfAssignedAnswers } = questionRow; // , isSelected
    //const questionKey: IQuestionKey = new QuestionKey(questionRow).questionKey!;
    const categoryKey: ICategoryKey = { topId, parentId, id: parentId! } // proveri

    const { canEdit, authUser } = useGlobalState();
    const { state, viewQuestion, addQuestion, editQuestion, deleteQuestion } = useCategoryContext();

    const { activeQuestion, formMode, selectedQuestionId } = state;
    const isSelected = id === selectedQuestionId;

    const showForm = activeQuestion !== null && activeQuestion.id === id;

    //const [alreadyAdding] = useState(formMode === FormMode.AddingQuestion);
    const alreadyAdding = formMode === FormMode.AddingQuestion;

    const del = () => {
        questionRow.modified = {
            time: new Date(),
            nickName: authUser.nickName
        }
        deleteQuestion(questionRow, showForm /* isActive */);
    };

    // const edit = async (Id: string) => {
    //     // Load data from server and reinitialize question
    //     await editQuestion(questionRow);
    // }

    const onSelectQuestion = async (id: string) => {
        if (canEdit)
            await editQuestion(questionRow);
        else
            await viewQuestion(questionRow);
    }

    const [hoverRef, hoverProps] = useHover();

    useEffect(() => {
        (async () => {
            if (isSelected) {
                switch (formMode) {
                    case FormMode.ViewingQuestion:
                        await viewQuestion(questionRow);
                        break;
                    case FormMode.EditingQuestion:
                        canEdit
                            ? await editQuestion(questionRow)
                            : await viewQuestion(questionRow);
                        break;
                }
                hoverRef.current?.scrollIntoView({ behavior: 'smooth', block: 'end' });
            }
        })()
    }, [canEdit, editQuestion, formMode, hoverRef, isSelected, questionRow, viewQuestion]);


    const Row1 =
        <div ref={hoverRef} className={`p-0 d-flex justify-content-start align-items-center w-100 position-relative question-row${showForm ? '-selected' : ''}`}>
            <Button
                variant='link'
                size="sm"
                className="d-flex align-items-center px-1 text-secondary"
            >
                <img width="22" height="18" src={Q} alt="Question" />
            </Button>
            <Button
                variant='link'
                size="sm"
                className={`p-0 px-1 m-1 ms-0 question-row-title ${showForm ? 'fw-bold' : ''}`}
                title={`id:${id!.toString()}`}
                onClick={() => onSelectQuestion(id!)}
                disabled={alreadyAdding}
            >
                {title}
            </Button>
            <Badge pill bg="secondary" className={`text-info ${numOfAssignedAnswers === 0 ? 'd-none' : 'd-inline'}`}>
                {numOfAssignedAnswers}a
                {/* <FontAwesomeIcon icon={faReply} size='sm' /> */}
                {/* <img width="22" height="18" src={A} alt="Answer"></img> */}
            </Badge>

            {/* {canEdit && !alreadyAdding && hoverProps.isHovered &&
                <Button variant='link' size="sm" className="ms-1 py-0 px-1 text-secondary"
                    //onClick={() => { dispatch({ type: ActionTypes.EDIT, question }) }}>
                    onClick={() => edit(_id!)}
                >
                    <FontAwesomeIcon icon={faEdit} size='lg' />
                </Button>
            } */}

            {canEdit && !alreadyAdding && hoverProps.isHovered &&
                <div className="position-absolute d-flex align-items-center top-0 end-0">
                    <Button variant='link' size="sm" className="ms-0 p-0 text-secondary"
                        onClick={del}
                    >
                        <FontAwesomeIcon icon={faRemove} size='lg' />
                    </Button>
                    <Button
                        variant='link'
                        size="sm"
                        className="ms-1 p-0 text-secondary d-flex align-items-center"
                        title="Add Question"
                        onClick={() => {
                            //const categoryInfo: ICategoryInfo = { categoryKey, level: 0 }
                            addQuestion(categoryKey, true);
                        }}
                    >
                        <img width="22" height="18" src={QPlus} alt="Add Question" />
                    </Button>
                </div>
            }
        </div>

    return (
        // border border-3 border-danger"
        // <div className="py-0 px-0 w-100 list-group-item border">
        <ListGroup.Item
            // variant={"primary"}
            className="py-0 px-0 w-100"
            as="li"
        >
            {showForm && formMode === FormMode.AddingQuestion &&
                <>
                    <div id='div-question' className="ms-0 d-md-none w-100">
                        <AddQuestion
                            showCloseButton={true}
                            source={0} />
                    </div>
                    <div className="d-none d-md-block  border rounded-3">
                        {Row1}
                    </div>
                </>
            }

            {showForm && formMode === FormMode.EditingQuestion &&
                <>
                    {/* <div class="d-lg-none">hide on lg and wider screens</div> */}
                    <div id='div-question' className="ms-0 d-md-none w-100">
                        <EditQuestion inLine={true} />
                    </div>
                    <div className="d-none d-md-block">
                        {Row1}
                    </div>
                </>
            }

            {showForm && formMode === FormMode.ViewingQuestion &&
                <>
                    {/* <div class="d-lg-none">hide on lg and wider screens</div> */}
                    <div id='div-question' className="ms-0 d-md-none w-100">
                        <ViewQuestion inLine={true} />
                    </div>
                    <div className="d-none d-md-block">
                        {Row1}
                    </div>
                </>
            }

            {!showForm &&
                <div className="d-none d-md-block">
                    {Row1}
                </div>
            }

        </ListGroup.Item>
    );
};

export default QuestionRow;
