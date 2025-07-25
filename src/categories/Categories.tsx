import React, { useEffect, useState } from 'react'
import { Container, Row, Col, Button } from "react-bootstrap";

import { useParams } from 'react-router-dom';

import { ActionTypes, ICategoryKey, IQuestionKey, ICategoryKeyExpanded, ICategory, ICategoryRow, FormMode, IsCategory } from "./types";

import { useGlobalContext, useGlobalState } from 'global/GlobalProvider';

import { CategoryProvider, useCategoryContext, useCategoryDispatch } from "./CategoryProvider";

import CategoryList from "categories/components/CategoryList";
import ViewCategory from "categories/components/ViewCategory";
import EditCategory from "categories/components/EditCategory";
import ViewQuestion from "categories/components/questions/ViewQuestion";
import EditQuestion from "categories/components/questions/EditQuestion";

import { initialCategory, initialQuestion } from "categories/CategoryReducer";
import ModalAddQuestion from './ModalAddQuestion';
import AddCategory from './components/AddCategory';
import { AutoSuggestQuestions } from './AutoSuggestQuestions';
import AddQuestion from './components/questions/AddQuestion';

interface IProps {
    categoryId_questionId?: string;
    fromChatBotDlg?: string;
}

const Providered = ({ categoryId_questionId, fromChatBotDlg }: IProps) => {
    console.log("=== Categories", categoryId_questionId)
    const { state, openNode, loadTopRows } = useCategoryContext();
    const {
        topRows, topRowsLoading, topRowsLoaded,
        keyExpanded, categoryId_questionId_done,
        nodeOpening, nodeOpened,
        activeCategory,
        activeQuestion,
        formMode,
        loadingCategories,
        loadingQuestions,
        loadingCategory,
        loadingQuestion
    } = state;

    const { setLastRouteVisited, searchQuestions } = useGlobalContext();
    const { isDarkMode, authUser, categoryRows } = useGlobalState();

    const [modalShow, setModalShow] = useState(false);
    const handleClose = () => {
        setModalShow(false);
    }

    const [newQuestion, setNewQuestion] = useState({ ...initialQuestion });
    const [createQuestionError, setCreateQuestionError] = useState("");

    const dispatch = useCategoryDispatch();

    const onSelectQuestion = async (questionKey: IQuestionKey) => {
        //navigate(`/categories/${questionKey.topId}_${questionKey.id}`)
        dispatch({ type: ActionTypes.SET_QUESTION_SELECTED, payload: { questionKey } })
    }

    const [catKeyExpanded, setCatKeyExpanded] = useState<ICategoryKeyExpanded>({
        topId: '', // null
        parentId: null,
        id: '',
        questionId: keyExpanded ? keyExpanded.questionId : null
    })

    const categoryRow: ICategoryRow = {
        ...initialCategory,
        level: 1,
        categoryRows: topRows
    }


    let tekst = '';

    useEffect(() => {
        (async () => {
            // SET_TOP_ROWS  Level:1
            if (!topRowsLoading && !topRowsLoaded) {
                await loadTopRows()
            }
        })()
    }, [topRowsLoading, topRowsLoaded, loadTopRows]);

    useEffect(() => {
        (async () => {
            if (!nodeOpening && topRows.length > 0) {
                if (categoryId_questionId) {
                    if (categoryId_questionId === 'add_question') {
                        const sNewQuestion = localStorage.getItem('New_Question');
                        if (sNewQuestion) {
                            const q = JSON.parse(sNewQuestion);
                            setNewQuestion({ ...initialQuestion, categoryTitle: 'Select', ...q })
                            setModalShow(true);
                            localStorage.removeItem('New_Question');
                            return null;
                        }
                    }
                    else if (categoryId_questionId !== categoryId_questionId_done) { //} && !nodeOpened) {
                        const arr = categoryId_questionId.split('_');
                        const categoryId = arr[0];
                        const questionId = arr[1];
                        const keyExp: ICategoryKeyExpanded = { topId:'nadji', parentId: 'isto', id: categoryId, questionId: questionId === 'null' ? null : questionId }
                        // setCatKeyExpanded(keyExp);
                        console.log('zovem openNode 1111111111111111111)', { categoryId_questionId }, { categoryId_questionId_done })
                        await openNode(keyExp, fromChatBotDlg ?? 'false')
                            .then(() => { return null; });
                    }
                }
                else if (keyExpanded && !nodeOpened) {
                    console.log('zovem openNode 2222222222222)', { keyExpanded }, { nodeOpened })
                    await openNode(keyExpanded)
                        .then(() => { return null; });
                }
            }
        })()
    }, [keyExpanded, nodeOpening, nodeOpened, openNode, categoryId_questionId, categoryId_questionId_done, topRowsLoaded])

    useEffect(() => {
        setLastRouteVisited(`/categories`);
    }, [setLastRouteVisited])

    if (categoryId_questionId !== 'add_question') {
        if (/*keyExpanded ||*/ (categoryId_questionId && categoryId_questionId !== categoryId_questionId_done)) {
            console.log("zzzzzz loading...", { keyExpanded, categoryId_questionId, categoryId_questionId_done })
            return <div>loading...</div>
        }
    }

    console.log('===>>> Categories !!!!!!!!!!!!!!!!!')
    //if (!nodeOpened)
    if (topRows.length === 0)
        return null

    return (
        <>
            <Container>
                <h5 className="text-warning mx-auto w-75 fw-bold"><span className='categories'>Categories / </span><span className='questions'>Questions</span></h5>

                <Row className={`${isDarkMode ? "dark" : ""}`}>
                    <Col>
                        <div className="d-flex justify-content-start align-items-center">
                            <div className="w-75 my-1 questions">
                                <AutoSuggestQuestions
                                    tekst={tekst}
                                    onSelectQuestion={onSelectQuestion}
                                    categoryRows={categoryRows}
                                    searchQuestions={searchQuestions}
                                />
                            </div>
                        </div>
                    </Col>
                </Row>

                <Button variant="secondary" size="sm" type="button" style={{ padding: '1px 4px' }}
                    onClick={() => dispatch({
                        type: ActionTypes.ADD_SUB_CATEGORY,
                        payload: {
                            categoryKey: catKeyExpanded,
                            level: 1
                        }
                    })
                    }
                >
                    Add Category
                </Button>

                <Row className="my-1">
                    <Col xs={12} md={5}>
                        <div className="categories-border" style={{ position: 'relative' }}>
                            <CategoryList categoryRow={categoryRow} level={0} title="root" isExpanded={true} />
                        </div>

                    </Col>
                    <Col xs={0} md={7}>
                        {/* <div class="d-none d-lg-block">hide on screens smaller than lg</div> */}
                        <div id='div-details' className="d-none d-md-block">
                            {activeCategory && formMode === FormMode.ViewingCategory && <ViewCategory inLine={false} />}
                            {activeCategory && formMode === FormMode.EditingCategory && <EditCategory inLine={false} />}
                            {activeCategory && formMode === FormMode.AddingCategory && <AddCategory />}

                            {activeQuestion && formMode === FormMode.ViewingQuestion && <ViewQuestion inLine={false} />}
                            {activeQuestion && formMode === FormMode.EditingQuestion && <EditQuestion inLine={false} />}
                            {activeQuestion && formMode === FormMode.AddingQuestion && <AddQuestion />}
                        </div>
                    </Col>
                </Row>
            </Container>
            {modalShow && activeQuestion &&
                <ModalAddQuestion
                    show={modalShow}
                    onHide={() => { setModalShow(false) }}
                    newQuestionRow={newQuestion}
                />
            }


            {(loadingCategories || loadingQuestions) &&
                <div className="d-flex justify-content-center align-items-center" style={{ position: 'absolute', top: '40%', left: '20%' }}>
                    <div className={`spinner-border ${loadingQuestions ? 'question' : 'category'}-spinner`} role="status">
                        <span className="visually-hidden">Loading...</span>
                    </div>
                </div>
            }

            {loadingCategory &&
                <div className="d-flex justify-content-center align-items-center" style={{ position: 'absolute', top: '50%', left: '50%' }}>
                    <div className="spinner-border category-spinner" role="status">
                        <span className="visually-hidden">Loading...</span>
                    </div>
                </div>
            }

            {loadingQuestion &&
                <div className="d-flex justify-content-center align-items-center" style={{ position: 'absolute', top: '50%', left: '50%' }}>
                    <div className="spinner-border question-spinner" role="status">
                        <span className="visually-hidden">Loading...</span>
                    </div>
                </div>
            }
        </>
    );
};

type Params = {
    categoryId_questionId?: string;
    fromChatBotDlg?: string;
};

const Categories = () => {
    let { categoryId_questionId, fromChatBotDlg } = useParams<Params>();

    if (categoryId_questionId && categoryId_questionId === 'categories')
        categoryId_questionId = undefined;

    if (categoryId_questionId) {
        const arr = categoryId_questionId!.split('_');
        console.assert(arr.length === 2, "expected 'categoryId_questionId'")
    }
    // const globalState = useGlobalState();
    // const { isAuthenticated } = globalState;

    // if (!isAuthenticated)
    //     return <div>categories loading...</div>;

    return (
        <CategoryProvider>
            <Providered categoryId_questionId={categoryId_questionId} fromChatBotDlg={fromChatBotDlg} />
        </CategoryProvider>
    )
}

export default Categories;

