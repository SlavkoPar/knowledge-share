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
    console.log("=== Groups", groupId_answerId)
    const { state, openGroupNode, loadTopGroupRows: loadFirstLevelGroupRows } = useGroupContext();
    const {
        topGroupRows, topGroupRowsLoading, topGroupRowsLoaded,
        groupKeyExpanded, groupId_answerId_done,
        groupNodeOpening, groupNodeOpened,
        activeGroup,
        activeAnswer,
        formMode
    } = state;

    const { setLastRouteVisited, searchAnswers, loadAndCacheAllGroupRows } = useGlobalContext();
    const { isDarkMode, authUser, groupRows, shortGroupsLoaded } = useGlobalState();

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
        answerId: groupKeyExpanded ? groupKeyExpanded.answerId : null
    })

    const groupRow: IGroupRow = {
        ...initialGroup,
        level: 1,
        groupRows: topGroupRows
    }


    let tekst = '';

    useEffect(() => {
        (async () => {
            // SET_FIRST_LEVEL_GROUP_ROWS  Level:1
            if (!topGroupRowsLoading && !topGroupRowsLoaded) {
                await loadFirstLevelGroupRows()
            }
        })()
    }, [topGroupRowsLoading, topGroupRowsLoaded, loadFirstLevelGroupRows]);

    useEffect(() => {
        (async () => {
            if (!groupNodeOpening && topGroupRows.length > 0) {
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
                    else if (groupId_answerId !== groupId_answerId_done) { //} && !groupNodeOpened) {
                        const arr = groupId_answerId.split('_');
                        const groupId = arr[0];
                        const answerId = arr[1];
                        const keyExp = { partitionKey: null, id: groupId, answerId }
                        // setCatKeyExpanded(keyExp);
                        console.log('zovem openGroupNode 1111111111111111111)', { groupId_answerId }, { groupId_answerId_done })
                        await openGroupNode(keyExp, fromChatBotDlg ?? 'false')
                            .then(() => { return null; });
                    }
                }
                else if (groupKeyExpanded && !groupNodeOpened) {
                    console.log('zovem openGroupNode 2222222222222)', { groupKeyExpanded }, { groupNodeOpened })
                    await openGroupNode(groupKeyExpanded)
                        .then(() => { return null; });
                }
            }
        })()
    }, [groupKeyExpanded, groupNodeOpening, groupNodeOpened, openGroupNode, groupId_answerId, groupId_answerId_done, topGroupRowsLoaded])

    useEffect(() => {
        setLastRouteVisited(`/groups`);
    }, [setLastRouteVisited])

    useEffect(() => {
        if (!shortGroupsLoaded) {
            loadAndCacheAllGroupRows();
        }
    }, [shortGroupsLoaded])


    if (groupId_answerId !== 'add_answer') {
        if (/*groupKeyExpanded ||*/ (groupId_answerId && groupId_answerId !== groupId_answerId_done)) {
            console.log("zzzzzz loading...", { groupKeyExpanded, groupId_answerId, groupId_answerId_done })
            return <div>loading...</div>
        }
    }


    console.log('===>>> Groups !!!!!!!!!!!!!!!!!')
    //if (!groupNodeOpened)
    if (!shortGroupsLoaded || topGroupRows.length === 0)
        return null

    return (
        <>
            <Container>
                <h6 style={{ color: 'rgb(13, 110, 253)', marginLeft: '30%' }}>Groups / Answers</h6>

                <Row className={`${isDarkMode ? "dark" : ""}`}>
                    <Col>
                        <div className="d-flex justify-content-start align-items-center">
                            <div className="w-75 my-1 answers">
                                <AutoSuggestAnswers
                                    tekst={tekst}
                                    onSelectAnswer={onSelectAnswer}
                                    shortGroups={groupRows}
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
                    <Col xs={12} md={5}>
                        <div>
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

