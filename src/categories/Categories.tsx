import React, { useEffect, useState } from 'react'
import { Container, Row, Col, Button } from "react-bootstrap";

import { useParams } from 'react-router-dom';

import { ActionTypes, ICategoryKey, IQuestionKey, ICategoryRow, FormMode } from "./types";

import { useGlobalContext, useGlobalState } from 'global/GlobalProvider';

import { CategoryProvider, useCategoryContext, useCategoryDispatch } from "./CategoryProvider";

import CategoryList from "categories/components/CategoryList";
import ViewCategory from "categories/components/ViewCategory";
import EditCategory from "categories/components/EditCategory";
import ViewQuestion from "categories/components/questions/ViewQuestion";
import EditQuestion from "categories/components/questions/EditQuestion";

import { initialQuestion } from "categories/CategoryReducer";
import ModalAddQuestion from './ModalAddQuestion';
import AddCategory from './components/AddCategory';
import { AutoSuggestQuestions } from './AutoSuggestQuestions';
import AddQuestion from './components/questions/AddQuestion';

interface IProps {
    categoryId_questionId?: string;
    fromChatBotDlg?: string;
}

const Providered = ({ categoryId_questionId, fromChatBotDlg }: IProps) => {
    const { state, openNode, loadTopRows, addSubCategory } = useCategoryContext();
    const {
        allCategoryRows, //allCategoryRowsLoaded,
        topRows, topRowsLoading, topRowsLoaded,
        keyExpanded,
        categoryId_questionId_done,
        nodeOpening, nodeOpened,
        activeCategory,
        activeQuestion,
        formMode,
        loadingCategories, loadingCategory,
        loadingQuestions, loadingQuestion
    } = state;

    const { setLastRouteVisited, searchQuestions } = useGlobalContext();
    const { isDarkMode } = useGlobalState();

    const [modalShow, setModalShow] = useState(false);
    // const handleClose = () => {
    //     setModalShow(false);
    // }

    const [newQuestion, setNewQuestion] = useState({ ...initialQuestion });

    const dispatch = useCategoryDispatch();

    const onSelectQuestion = async (questionKey: IQuestionKey) => {
        //navigate(`/categories/${questionKey.topId}_${questionKey.id}`)
        dispatch({ type: ActionTypes.SET_QUESTION_SELECTED, payload: { questionKey } })
    }

    // const categoryRow: ICategoryRow = {
    //     topId: '',
    //     id: '',
    //     parentId: null,
    //     kind: 0,
    //     title: '',
    //     link: '',
    //     header: '',
    //     level: 1,
    //     hasSubCategories: false,
    //     categoryRows: topRows,
    //     variations: [],
    //     numOfQuestions: 0,
    //     questionRows: []
    // }

    let tekst = '';

    // useEffect(() => {
    //     (async () => {
    //         // SET_TOP_ROWS  Level:1
    //         if (!allCategoryRowsLoaded) {
    //             console.log('Zovem loadAllCategoryRows()')
    //             await loadAllCategoryRows();
    //         }
    //     })()
    // }, [allCategoryRowsLoaded, loadAllCategoryRows]);


    useEffect(() => {
        (async () => {
            // SET_TOP_ROWS  Level:1
            if (!topRowsLoading && !topRowsLoaded) {
                console.log('ZOVEM 111 loadTopRows()')
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
                        const catKey: ICategoryKey = { topId: '', id: categoryId, parentId: 'ROOT' };
                        console.log('zovem openNode 1111111111111111111)', { categoryId_questionId }, { categoryId_questionId_done })
                        await openNode(catKey, questionId, fromChatBotDlg ?? 'false')
                            .then(() => { return null; });
                    }
                }
                else if (keyExpanded && !nodeOpened) {
                    const { topId, categoryId, questionId } = keyExpanded;
                    if (categoryId !== '') {
                        const catKey: ICategoryKey = { topId, id: categoryId, parentId: 'ROOT' }
                        console.log('zovem openNode 2222222222222)', { keyExpanded, catKey })
                        await openNode(catKey, questionId)
                            .then(() => { return null; });
                    }
                }
            }
        })()
    }, [keyExpanded, nodeOpening, nodeOpened, openNode, categoryId_questionId, categoryId_questionId_done, topRows, fromChatBotDlg])

    // useEffect(() => {
    //     setLastRouteVisited(`/categories`);
    // }, [setLastRouteVisited])

    if (categoryId_questionId !== 'add_question') {
        if (/*keyExpanded ||*/ (categoryId_questionId && categoryId_questionId !== categoryId_questionId_done)) {
            console.log("zzzzzz loading...", { keyExpanded, categoryId_questionId, categoryId_questionId_done })
            return <div>loading...</div>
        }
    }


    //if (!nodeOpened)
    //if (!allCategoryRowsLoaded || !topRowsLoaded || topRows.length === 0) {
    if (!topRowsLoaded || topRows.length === 0) {
        console.log('===>>> Categories  VRATIO')
        return null
    }

    console.log('===>>> Categories !!!!!!!!!!!!!!!!!', activeCategory)

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
                                    allCategoryRows={allCategoryRows}
                                    searchQuestions={searchQuestions}
                                />
                            </div>
                        </div>
                    </Col>
                </Row>

                <Button variant="secondary" size="sm" type="button" style={{ padding: '1px 4px' }}
                    onClick={
                        () => addSubCategory(null)
                    }
                >
                    Add Category
                </Button>

                <Row className="my-1 h-auto">
                    <Col xs={12} md={5}>
                        <div className="categories-border" style={{ position: 'relative' }}>
                            <CategoryList categoryRow={null} title="ROOT" isExpanded={true} />
                        </div>
                    </Col>
                    <Col xs={0} md={7}>
                        {/* visible on medium screens and above. */}
                        <div id='div-details' className="d-none d-md-block">
                            {activeCategory && formMode === FormMode.ViewingCategory && <ViewCategory inLine={false} />}
                            {activeCategory && formMode === FormMode.EditingCategory &&
                                <>
                                    <EditCategory inLine={false} />
                                </>
                            }
                            {activeCategory && formMode === FormMode.AddingCategory && <AddCategory />}

                            {activeQuestion && formMode === FormMode.ViewingQuestion && <ViewQuestion inLine={false} />}
                            {activeQuestion && formMode === FormMode.EditingQuestion &&
                                <EditQuestion inLine={false} />
                            }
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

