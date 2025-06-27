import React, { useCallback, useEffect, useState } from 'react';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faEdit, faRemove, faCaretRight, faCaretDown, faPlus, faFolder } from '@fortawesome/free-solid-svg-icons'
import QPlus from 'assets/QPlus.png';

import { ListGroup, Button, Badge } from "react-bootstrap";

import { useGlobalState } from 'global/GlobalProvider'
import { ActionTypes, ICategoryInfo, ICategoryKey, ICategoryKeyExpanded, ICategoryRow, FormMode, IExpandInfo } from "categories/types";
import { useCategoryContext, useCategoryDispatch } from 'categories/CategoryProvider'
import { useHover } from 'hooks/useHover';
import { ICategory } from 'categories/types'

import CategoryList from "categories/components/CategoryList";
import EditCategory from "categories/components/EditCategory";
import ViewCategory from "categories/components/ViewCategory";
import QuestionList from './questions/QuestionList';
import AddCategory from './AddCategory';

const CategoryRow = ({ categoryRow, questionId }: { categoryRow: ICategoryRow, questionId: string | null }) => {

    const { partitionKey, id, title, level, hasSubCategories, subCategoryRows: subCategories,
        numOfQuestions, questionRows, isExpanded, rootId } = categoryRow;

    const categoryKey: ICategoryKey = { partitionKey, id }

    // const [categoryKey] = useState<ICategoryKey>({ partitionKey, id }); // otherwise reloads
    const [catKeyExpanded] = useState<ICategoryKeyExpanded>({ partitionKey, id, questionId }); // otherwise reloads

    const { canEdit, isDarkMode, variant, bg, authUser } = useGlobalState();

    const { state, addSubCategory, viewCategory, editCategory, deleteCategory, expandCategory, collapseCategory, addQuestion } = useCategoryContext();
    const { formMode, categoryKeyExpanded, activeCategory } = state;
    const isSelected = activeCategory !== null && (activeCategory.id === id);
    const showForm = isSelected;


    const alreadyAdding = formMode === FormMode.AddingCategory;
    // TODO proveri ovo
    const showQuestions = isExpanded && numOfQuestions > 0 // || questions.find(q => q.inAdding) // && !questions.find(q => q.inAdding); // We don't have questions loaded
    console.log("----------------CategoryRow", id, numOfQuestions, questionRows, isExpanded)

    const deleteCategoryRow = () => {
        categoryRow.modified = {
            time: new Date(),
            nickName: authUser.nickName
        }
        deleteCategory(categoryRow);
    };

    const handleExpandClick = async () => {
        if (isExpanded)
            await collapseCategory(categoryRow);
        else {
            const expandInfo: IExpandInfo = {
                rootId: rootId!,
                categoryKey,
                includeQuestionId: null,
                formMode: canEdit ? FormMode.EditingCategory : FormMode.ViewingCategory
            }
            await expandCategory(expandInfo);
        }
    }


    const edit = async () => {
        // Load data from server and reinitialize category
        await editCategory(categoryRow, questionId ?? 'null');
    }

    // const onSelectCategory = useCallback(() =>
    //     async (): Promise<any> => {
    //         if (canEdit)
    //             await editCategory(categoryRow, questionId ?? 'null');
    //         else
    //             await viewCategory(categoryRow, questionId ?? 'null');
    //     }, [])

    const onSelectCategory = async (): Promise<any> => {
        if (canEdit)
            await editCategory(categoryRow, questionId ?? 'null');
        else
            await viewCategory(categoryRow, questionId ?? 'null');
    }

    useEffect(() => {
        if (numOfQuestions > 0 && !isExpanded) { //!isExpanded && !isSelected) {
            if (categoryKeyExpanded && categoryKeyExpanded.id === id) { // catKeyExpanded.id) {
                console.log('%%%%%%%%%%%%%%%%%%%%%%%% Zovem iz CategoryRow', categoryKeyExpanded.id, id)
                const expandInfo: IExpandInfo = {
                    rootId: rootId!,
                    categoryKey,
                    includeQuestionId: questionId,
                    formMode: canEdit ? FormMode.EditingCategory : FormMode.ViewingCategory
                }
                expandCategory(expandInfo);
            }
        }
    }, [id, isExpanded, isSelected, expandCategory, categoryKeyExpanded]) // 

    useEffect(() => {
        (async () => {
            if (isSelected) {
                switch (formMode) {
                    case FormMode.ViewingCategory:
                        await viewCategory(categoryRow, questionId ?? 'null');
                        break;
                    case FormMode.EditingQuestion:
                        canEdit
                            ? await editCategory(categoryRow, questionId ?? 'null')
                            : await viewCategory(categoryRow, questionId ?? 'null');
                        break;
                }
            }
        })()
    }, [isSelected]);

    const [hoverRef, hoverProps] = useHover();

    {/* <ListGroup horizontal> */ }
    const Row1 =
        <div ref={hoverRef} className="d-flex justify-content-start align-items-center w-100 text-primary category-row ">
            <Button
                variant='link'
                size="sm"
                className="py-0 px-1  bg-light"
                onClick={(e) => { handleExpandClick(); e.stopPropagation() }}
                title="Expand"
                disabled={alreadyAdding || (!hasSubCategories && numOfQuestions === 0)}
            >
                <FontAwesomeIcon icon={isExpanded ? faCaretDown : faCaretRight} size='lg' />
            </Button>
            <Button
                variant='link'
                size="sm"
                className="py-0 px-1  bg-light"
                // onClick={expand}
                title="Expand"
                disabled={true} //{alreadyAdding || (!hasSubCategories && numOfQuestions === 0)}
            >
                <FontAwesomeIcon icon={faFolder} size='sm' />
            </Button>
            <Button
                variant='link'
                size="sm"
                className={`py-0 mx-0 text-decoration-none bg-light  ${isSelected ? 'fw-bold' : ''}`}
                title={id}
                onClick={onSelectCategory}
                disabled={alreadyAdding}
            >
                {title}
            </Button>

            <Badge pill bg="secondary" className={numOfQuestions === 0 ? 'd-none' : 'd-inline'}>
                {numOfQuestions}Q
                {/* <FontAwesomeIcon icon={faQuestion} size='sm' /> */}
                {/* <img width="22" height="18" src={Q} alt="Question" /> */}
            </Badge>

            {canEdit && !alreadyAdding && hoverProps.isHovered &&
                <>
                    <Button variant='link' size="sm" className="ms-1 py-0 px-0"
                        //onClick={() => { dispatch({ type: ActionTypes.EDIT, category }) }}>
                        onClick={() => edit()}
                    >
                        <FontAwesomeIcon icon={faEdit} size='lg' />
                    </Button>
                    <Button
                        variant='link'
                        size="sm"
                        className="py-0 mx-1 text-primary float-end"
                        title="Add SubCategory"
                        onClick={() => {
                            categoryRow.level += 1;
                            addSubCategory(categoryRow)
                            //</>const categoryInfo: ICategoryInfo = { categoryKey: { partitionKey, id: parentCategory }, level: 0 }
                            // dispatch({
                            //     type: ActionTypes.ADD_SUB_CATEGORY,
                            //     payload: {
                            //         rootId,
                            //         categoryKey,
                            //         level: categoryRow.level + 1
                            //     }
                            // })
                            // if (!isExpanded)
                            //     dispatch({ type: ActionTypes.SET_EXPANDED, payload: { categoryKey } });
                        }}
                    >
                        <FontAwesomeIcon icon={faPlus} size='lg' />
                    </Button>
                </>
            }

            {/* TODO what about archive questions  numOfQuestions === 0 &&*/}
            {canEdit && !alreadyAdding && hoverProps.isHovered && !hasSubCategories &&
                <div className="position-absolute d-flex align-items-center top-0 end-0">
                    <Button
                        variant='link'
                        size="sm"
                        className="py-0 mx-1 text-secondary float-end"
                        title="Add Question"
                        onClick={async () => {
                            const categoryInfo: ICategoryInfo = { categoryKey: { partitionKey, id: categoryRow.id }, level: categoryRow.level }
                            addQuestion(categoryKey, rootId!);
                        }}
                    >
                        <img width="22" height="18" src={QPlus} alt="Add Question" />
                    </Button>

                    <Button variant='link' size="sm" className="py-0 mx-1 float-end"
                        disabled={hasSubCategories || numOfQuestions > 0}
                        onClick={deleteCategoryRow}
                    >
                        <FontAwesomeIcon icon={faRemove} size='lg' />
                    </Button>
                </div>
            }
        </div>

    // console.log({ title, isExpanded })

    // if (category.level !== 1)
    //     return (<div>CategoryRow {category.id}</div>)

    return (
        <>
            <ListGroup.Item
                variant={"primary"}
                className="py-0 px-1 w-100"
                as="li"
            >
                {/*inAdding &&*/showForm && formMode === FormMode.AddingCategory &&
                    <>
                        <div className="ms-0 d-md-none w-100">
                            <AddCategory />
                        </div>
                        <div className="d-none d-md-block">
                            {Row1}
                        </div>
                    </>
                }
                {showForm && formMode === FormMode.EditingCategory &&
                    <>
                        {/* <div class="d-lg-none">hide on lg and wider screens</div> */}
                        <div id='divInLine' className="ms-0 d-md-none w-100">
                            {formMode === FormMode.EditingCategory && <EditCategory inLine={false} />}
                        </div>
                        <div className="d-none d-md-block">
                            {Row1}
                        </div>
                    </>
                }

                {showForm && formMode === FormMode.ViewingCategory &&
                    <>
                        {/* <div class="d-lg-none">hide on lg and wider screens</div> */}
                        <div id='divInLine' className="ms-0 d-md-none w-100">
                            <ViewCategory inLine={false} />
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

            {state.error && state.whichRowId === id && <div className="text-danger">{state.error.message}</div>}

            {/* !inAdding && */}
            {(isExpanded) && // Row2   //  || inAdding
                <ListGroup.Item
                    className="py-0 px-0 border-0 border-warning border-bottom-0" // border border-3 "
                    variant={"primary"}
                    as="li"
                >
                    {isExpanded &&
                        <>
                            {hasSubCategories &&
                                <CategoryList level={level + 1} categoryRow={categoryRow} title={title} isExpanded={isExpanded} />
                            }
                            {showQuestions &&
                                <QuestionList level={level + 1} categoryRow={categoryRow} />
                            }
                        </>
                    }

                </ListGroup.Item>
            }
        </>
    );
};

export default CategoryRow;
