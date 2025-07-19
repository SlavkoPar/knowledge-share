import React, { useEffect, useState } from 'react'
import { Container, Row, Col, Button } from "react-bootstrap";

import { useParams } from 'react-router-dom';

import { ActionTypes, IGroupKey, IAnswerKey, IGroupKeyExpanded, IGroup, IGroupRow, FormMode, IsGroup } from "./types";

import { useGlobalContext, useGlobalState } from 'global/GlobalProvider';

import { GroupProvider, useGroupContext, useGroupDispatch } from "./GroupProvider";

import GroupList from "groups/components/GroupList";
import ViewGroup from "groups/components/ViewGroup";
import EditGroup from "groups/components/EditGroup";
import ViewAnswer from "groups/components/answers/ViewAnswer";
import EditAnswer from "groups/components/answers/EditAnswer";

import { initialGroup, initialAnswer } from "groups/GroupReducer";
import ModalAddAnswer from './ModalAddAnswer';
import AddGroup from './components/AddGroup';
import { AutoSuggestAnswers } from './AutoSuggestAnswers';
import AddAnswer from './components/answers/AddAnswer';

interface IProps {
    groupId_answerId?: string;
    fromChatBotDlg?: string;
}

const Providered = ({ groupId_answerId, fromChatBotDlg }: IProps) => {
    const { state, openNode, loadTopGroupRows } = useGroupContext();
    const {
        topRows, topRowsLoading, topRowsLoaded,
        keyExpanded, groupId_answerId_done,
        nodeOpening, nodeOpened,
        activeGroup,
        activeAnswer,
        loadingGroups, loadingAnswers,
        loadingGroup, loadingAnswer,
        formMode} = state;

    const { setLastRouteVisited, searchAnswers, loadAndCacheAllGroupRows } = useGlobalContext();
    const { isDarkMode, authUser, groupRows, groupRowsLoaded } = useGlobalState();

    const [modalShow, setModalShow] = useState(false);
    const handleClose = () => {
        setModalShow(false);
    }

    const [newAnswer, setNewAnswer] = useState({ ...initialAnswer });
    const [createAnswerError, setCreateAnswerError] = useState("");

    const dispatch = useGroupDispatch();

    const onSelectAnswer = async (answerKey: IAnswerKey) => {
        //navigate(`/groups/${answerKey.partitionKey}_${answerKey.id}`)
        dispatch({ type: ActionTypes.SET_ANSWER_SELECTED, payload: { answerKey } })
    }

    const [catKeyExpanded, setCatKeyExpanded] = useState<IGroupKeyExpanded>({
        partitionKey: null,
        id: null,
        answerId: keyExpanded ? keyExpanded.answerId : null
    })

    const groupRow: IGroupRow = {
        ...initialGroup,
        level: 1,
        groupRows: topRows
    }


    let tekst = '';

    useEffect(() => {
        (async () => {
            // SET_FIRST_LEVEL_GROUP_ROWS  Level:1
            if (!topRowsLoading && !topRowsLoaded) {
                await loadTopGroupRows()
            }
        })()
    }, [topRowsLoading, topRowsLoaded, loadTopGroupRows]);

    useEffect(() => {
        (async () => {
            if (!nodeOpening && topRows.length > 0) {
                if (groupId_answerId) {
                    if (groupId_answerId === 'add_answer') {
                        const sNewAnswer = localStorage.getItem('New_Answer');
                        if (sNewAnswer) {
                            const q = JSON.parse(sNewAnswer);
                            setNewAnswer({ ...initialAnswer, groupTitle: 'Select', ...q })
                            setModalShow(true);
                            localStorage.removeItem('New_Answer');
                            return null;
                        }
                    }
                    else if (groupId_answerId !== groupId_answerId_done) { //} && !nodeOpened) {
                        const arr = groupId_answerId.split('_');
                        const groupId = arr[0];
                        const answerId = arr[1];
                        const keyExp = { partitionKey: null, id: groupId, answerId }
                        // setCatKeyExpanded(keyExp);
                        console.log('zovem openNode 1111111111111111111)', { groupId_answerId }, { groupId_answerId_done })
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
    }, [keyExpanded, nodeOpening, nodeOpened, openNode, groupId_answerId, groupId_answerId_done, topRowsLoaded])

    useEffect(() => {
        setLastRouteVisited(`/groups`);
    }, [setLastRouteVisited])

    useEffect(() => {
        if (!groupRowsLoaded) {
            loadAndCacheAllGroupRows();
        }
    }, [groupRowsLoaded])


    if (groupId_answerId !== 'add_answer') {
        if (/*keyExpanded ||*/ (groupId_answerId && groupId_answerId !== groupId_answerId_done)) {
            console.log("zzzzzz loading...", { keyExpanded, groupId_answerId, groupId_answerId_done })
            return <div>loading...</div>
        }
    }


    //if (!nodeOpened)
    if (!groupRowsLoaded || topRows.length === 0)
        return null

    return (
        <>
            <Container>
                    <h5 className="text-warning mx-auto w-75 fw-bold"><span className='groups'>Group / </span><span className='answers'>Answers</span></h5>


                <Row className={`${isDarkMode ? "dark" : ""}`}>
                    <Col>
                        <div className="d-flex justify-content-start align-items-center">
                            <div className="w-75 my-1 answers">
                                <AutoSuggestAnswers
                                    tekst={tekst}
                                    onSelectAnswer={onSelectAnswer}
                                    groupRows={groupRows}
                                    searchAnswers={searchAnswers}
                                />
                            </div>
                        </div>
                    </Col>
                </Row>

                <Button variant="secondary" size="sm" type="button" style={{ padding: '1px 4px' }}
                    onClick={() => dispatch({
                        type: ActionTypes.ADD_SUB_GROUP,
                        payload: {
                            groupKey: catKeyExpanded,
                            level: 1
                        }
                    })
                    }
                >
                    Add Group
                </Button>
                <Row className="my-1">
                    <Col xs={12} md={5} >
                        <div className="groups-border">
                            <GroupList groupRow={groupRow} level={0} title="root" isExpanded={true} />
                        </div>
                    </Col>
                    <Col xs={0} md={7}>
                        {/* <div class="d-none d-lg-block">hide on screens smaller than lg</div> */}
                        <div id='div-details' className="d-none d-md-block">
                            {activeGroup && formMode === FormMode.ViewingGroup && <ViewGroup inLine={false} />}
                            {activeGroup && formMode === FormMode.EditingGroup && <EditGroup inLine={false} />}
                            {activeGroup && formMode === FormMode.AddingGroup && <AddGroup />}

                            {activeAnswer && formMode === FormMode.ViewingAnswer && <ViewAnswer inLine={false} />}
                            {activeAnswer && formMode === FormMode.EditingAnswer && <EditAnswer inLine={false} />}
                            {activeAnswer && formMode === FormMode.AddingAnswer && <AddAnswer />}
                        </div>
                    </Col>
                </Row>
            </Container>
            {modalShow && activeAnswer &&
                <ModalAddAnswer
                    show={modalShow}
                    onHide={() => { setModalShow(false) }}
                    newAnswerRow={newAnswer}
                />
            }
            {(loadingGroups || loadingAnswers) &&
                <div className="d-flex justify-content-center align-items-center" style={{ position: 'absolute', top: '40%', left: '20%' }}>
                    <div className={`spinner-border ${loadingAnswers ? 'answer' : 'group'}-spinner`} role="status">
                        <span className="visually-hidden">Loading...</span>
                    </div>
                </div>
            }

            {loadingGroup &&
                <div className="d-flex justify-content-center align-items-center" style={{ position: 'absolute', top: '50%', left: '50%' }}>
                    <div className="spinner-border group-spinner" role="status">
                        <span className="visually-hidden">Loading...</span>
                    </div>
                </div>
            }

            {loadingAnswer &&
                <div className="d-flex justify-content-center align-items-center" style={{ position: 'absolute', top: '50%', left: '50%' }}>
                    <div className="spinner-border answer-spinner" role="status">
                        <span className="visually-hidden">Loading...</span>
                    </div>
                </div>
            }
        </>
    );
};

type Params = {
    groupId_answerId?: string;
    fromChatBotDlg?: string;
};

const Groups = () => {
    let { groupId_answerId, fromChatBotDlg } = useParams<Params>();

    if (groupId_answerId && groupId_answerId === 'groups')
        groupId_answerId = undefined;

    if (groupId_answerId) {
        const arr = groupId_answerId!.split('_');
        console.assert(arr.length === 2, "expected 'groupId_answerId'")
    }
    // const globalState = useGlobalState();
    // const { isAuthenticated } = globalState;

    // if (!isAuthenticated)
    //     return <div>groups loading...</div>;

    return (
        <GroupProvider>
            <Providered groupId_answerId={groupId_answerId} fromChatBotDlg={fromChatBotDlg} />
        </GroupProvider>
    )
}

export default Groups;

