import React, { useEffect } from 'react';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faEdit, faRemove, faCaretRight, faCaretDown, faPlus, faFolder } from '@fortawesome/free-solid-svg-icons'
import QPlus from 'assets/QPlus.png';

import { ListGroup, Button, Badge } from "react-bootstrap";

import { useGlobalState } from 'global/GlobalProvider'
import { ICategoryKey, ICategoryRow, FormMode, IExpandInfo, CategoryKey, ActionTypes } from "categories/types";
import { useCategoryContext, useCategoryDispatch } from 'categories/CategoryProvider'
import { useHover } from 'hooks/useHover';

import CategoryList from "categories/components/CategoryList";
import EditCategory from "categories/components/EditCategory";
import ViewCategory from "categories/components/ViewCategory";
import QuestionList from './questions/QuestionList';
import AddCategory from './AddCategory';
import { CategoryReducer, subCatRow } from 'categories/CategoryReducer';

const CategoryRow = ({ categoryRow, questionId }: { categoryRow: ICategoryRow, questionId: string | null }) => {

    const { id, title, hasSubCategories, numOfQuestions, isExpanded } = categoryRow;
    categoryRow.level += 1;

    const categoryKey: ICategoryKey = new CategoryKey(categoryRow).categoryKey!;

    // const [categoryKey] = useState<ICategoryKey>({ topId, id }); // otherwise reloads
    // const [catKeyExpanded] = useState<IQuestionKey>({ topId, id, questionId }); // otherwise reloads

    const { canEdit, authUser } = useGlobalState();

    const { state, addSubCategory, viewCategory, editCategory, deleteCategory, expandCategory, collapseCategory, addQuestion } = useCategoryContext();
    const dispatch = useCategoryDispatch();

    let { formMode, keyExpanded, activeCategory, rowExpanding, loadingCategory, categoryLoaded } = state;
    const isSelected = activeCategory !== null && (activeCategory.id === id);

    const inAdding = formMode === FormMode.AddingCategory;
    // TODO proveri ovo
    const showQuestions = isExpanded && numOfQuestions > 0 // || questions.find(q => q.inAdding) // && !questions.find(q => q.inAdding); // We don't have questions loaded

    const deleteCategoryRow = () => {
        categoryRow.modified = {
            time: new Date(),
            nickName: authUser.nickName
        }
        deleteCategory(categoryRow);
    };

    const handleExpandClick = async () => {
        if (isExpanded) {
            await collapseCategory(categoryRow);
        }
        else {
            const expandInfo: IExpandInfo = {
                categoryKey,
                byClick: true,
                formMode: canEdit ? FormMode.EditingCategory : FormMode.ViewingCategory
            }
            await expandCategory(expandInfo);
        }
    }

    // const edit = async () => {
    //     // Load data from server and reinitialize category
    //     await editCategory(categoryRow, questionId ?? 'null');
    // }

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
        (async () => {
            if (isSelected && !loadingCategory && !categoryLoaded && !inAdding) {
                console.log('editCategoryyyyyyyyyyyyyyyyyyyyyyyyyyyyyyyyyyyyy')
                switch (formMode) {
                    case FormMode.ViewingCategory:
                        await viewCategory(categoryRow, questionId ?? 'null');
                        break;
                    case FormMode.EditingCategory:
                        canEdit
                            ? await editCategory(categoryRow, questionId ?? 'null')
                            : await viewCategory(categoryRow, questionId ?? 'null');
                        break;
                }
            }
        })()
    }, [canEdit, categoryLoaded, categoryRow, editCategory, formMode, inAdding, isSelected, loadingCategory, questionId, viewCategory]);

    const [hoverRef, hoverProps] = useHover();

    const Row1 =
        <>
            <div ref={hoverRef} className={`d-flex justify-content-start align-items-center w-100 category-row${isSelected ? '-selected' : ''}`} style={{ marginTop: '1px' }}>
                <Button
                    variant='link'
                    size="sm"
                    className="py-0 px-1" //  bg-light"
                    onClick={(e) => { handleExpandClick(); e.stopPropagation() }}
                    title="Expand"
                    disabled={inAdding || (!hasSubCategories && numOfQuestions === 0)}
                >
                    <FontAwesomeIcon icon={isExpanded ? faCaretDown : faCaretRight} size='lg' />
                </Button>
                <Button
                    variant='link'
                    size="sm"
                    className="py-0 px-1 bg-light"
                    // onClick={expand}
                    title="Expand"
                    disabled={true} //{alreadyAdding || (!hasSubCategories && numOfQuestions === 0)}
                >
                    <FontAwesomeIcon icon={faFolder} size='sm' />
                </Button>
                <Button
                    variant='link'
                    size="sm"
                    className={`py-0 ms-0 me-1 category-row-title ${isSelected ? 'fw-bold text-white bg-transparent' : ''}`}
                    title={id}
                    onClick={onSelectCategory}
                    disabled={inAdding}
                >
                    {title}&nbsp;<span>{formMode.substring(0, 3)}</span>&nbsp;<span>{hoverProps.isHovered?'hov':'jok'}</span>
                </Button>

                {numOfQuestions > 0 &&
                    <Badge pill bg="secondary" className={'d-inline bg-transparent'}>
                        {numOfQuestions}Q
                        {/* <FontAwesomeIcon icon={faQuestion} size='sm' /> */}
                        {/* <img width="22" height="18" src={Q} alt="Question" /> */}
                    </Badge>
                }

                {canEdit && hoverProps.isHovered && // && !alreadyAdding
                    // <div className="position-absolute d-flex align-items-center top-0 end-0 me-3">
                    <div className="position-absolute d-flex align-items-center top-0 end-0 me-3">
                        <Button
                            variant='link'
                            size="sm"
                            className="py-0 mx-1 text-white"
                            title="Add SubCategory"
                            onClick={async () => {
                                dispatch({ type: ActionTypes.CLOSE_CATEGORY_FORM, payload: {} })
                                if (!isExpanded) {
                                    await handleExpandClick();
                                }
                                categoryRow.level += 1;
                                addSubCategory(categoryRow);
                            }}
                        >
                            <FontAwesomeIcon icon={faPlus} size='lg' />
                        </Button>
                    </div>
                }

                {/* TODO what about archive questions  numOfQuestions === 0 &&*/}
                {canEdit && !inAdding && hoverProps.isHovered && !hasSubCategories &&
                    <div className="position-absolute d-flex align-items-center top-0 end-0 ">
                        <Button
                            variant='link'
                            size="sm"
                            className="py-0 mx-1 text-secondary"
                            title="Add Question"
                            onClick={async () => {
                                //const categoryInfo: ICategoryInfo = { categoryKey: { workspace: topId, id: categoryRow.id }, level: categoryRow.level }
                                addQuestion(categoryKey, isExpanded ?? false);
                            }}
                        >
                            <img width="22" height="18" src={QPlus} alt="Add Question" />
                        </Button>

                        <Button variant='link' size="sm" className="py-0 mx-1"
                            disabled={hasSubCategories || numOfQuestions > 0}
                            onClick={deleteCategoryRow}
                        >
                            <FontAwesomeIcon icon={faRemove} size='lg' />
                        </Button>
                    </div>
                }
            </div>
            {showQuestions &&
                <div className='ps-3'>
                    <QuestionList categoryRow={categoryRow} />
                </div>
            }
        </>

    // console.log({ title, isExpanded })

    // if (category.level !== 1)
    //     return (<div>CategoryRow {category.id}</div>)

    console.log('categoryRow:', id)

    return (
        <>
            <ListGroup.Item
                // variant={"primary"}
                className="py-0 px-1 w-100 category-bg"
                as="li"
            >
                {isSelected && formMode === FormMode.AddingCategory &&
                    <>
                        <div className="border border-3 border-success rounded float-end">
                            {Row1}
                        </div>
                        {/* ms-0 d-md-none w-100 */}
                        <div className="ms-0 d-md-none w-100">
                            <AddCategory />
                        </div>
                    </>
                }

                {isSelected && formMode === FormMode.EditingCategory &&
                    <>
                        {/* <div class="d-none d-md-block">
                            This content will be hidden on small screens and below, 
                            but visible on medium screens and above.</div> */}
                        <div className="border border-3 border-success rounded">
                            {Row1}
                        </div>
                        {/* <div id='divInLine' className="ms-0 d-md-none w-100"> */}
                        <div id='divInLine' className="ms-0 d-md-none w-100">
                            <EditCategory inLine={false} />
                        </div>
                    </>
                }

                {isSelected && formMode === FormMode.ViewingCategory &&
                    <>
                        {/* <div class="d-lg-none">hide on lg and wider screens</div> */}
                        <div className="border border-3 border-success rounded">
                            {Row1}
                        </div>
                        {/* <div id='divInLine' className="ms-0 d-md-none w-100"> */}
                        <div id='divInLine' className="ms-0 d-md-none w-100">
                            <ViewCategory inLine={false} />
                        </div>
                    </>
                }

                {!isSelected &&
                    <div className="border border-3 border-warning rounded">
                        {Row1}
                    </div>
                }

                {/* {isSelected &&
                    <div className="d-none d-md-block">
                        {Row1}
                    </div>
                } */}


            </ListGroup.Item>

            {state.error && state.whichRowId === id && <div className="text-danger">{state.error.message}</div>}

            {/* !inAdding && */}
            {(isExpanded) && // Row2   //  || inAdding
                <ListGroup.Item
                    className="py-0 px-0 border-0 border-warning border-bottom-0 category-bg" // border border-3 "
                    variant={"primary"}
                    as="li"
                >
                    {isExpanded &&
                        <>
                            {hasSubCategories &&
                                <CategoryList categoryRow={categoryRow} title={title} isExpanded={isExpanded} />
                            }
                            {/* {showQuestions &&
                                <QuestionList categoryRow={categoryRow} />
                            } */}
                        </>
                    }

                </ListGroup.Item>
            }
        </>
    );
};

export default CategoryRow;
