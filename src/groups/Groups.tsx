import React, { useEffect, useState } from 'react'
import { Container, Row, Col, Button } from "react-bootstrap";

import { useParams } from 'react-router-dom';

import { Mode, ActionTypes, IGroupKey, IAnswerKey, IGroupKeyExpanded } from "./types";

import { useGlobalContext, useGlobalState } from 'global/GlobalProvider';

import { GroupProvider, useGroupContext, useGroupDispatch } from "./GroupProvider";

import GroupList from "groups/components/GroupList";
import ViewGroup from "groups/components/ViewGroup";
import EditGroup from "groups/components/EditGroup";
import ViewAnswer from "groups/components/answers/ViewAnswer";
import EditAnswer from "groups/components/answers/EditAnswer";

import { initialGroup, initialAnswer } from "groups/GroupsReducer";
import ModalAddAnswer from './ModalAddAnswer';
import AddGroup from './components/AddGroup';
import { AutoSuggestAnswers } from 'groups/AutoSuggestAnswers';

interface IProps {
    groupId_answerId?: string;
    fromChatBotDlg?: string;
}

const Providered = ({ groupId_answerId, fromChatBotDlg }: IProps) => {
    console.log("=== Groups", groupId_answerId)
    const { state, reloadGroupNode } = useGroupContext();
    const { groupKeyExpanded, groupId_answerId_done, groupNodeReLoading, groupNodeLoaded, } = state;

    const { setLastRouteVisited, searchAnswers, loadShortGroups } = useGlobalContext();
    const { isDarkMode, authUser, shortGroups, shortGroupsLoaded } = useGlobalState();


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

    const [shortGroupKeyExpanded, setCatKeyExpanded] = useState<IGroupKeyExpanded>({
        partitionKey: null,
        id: null,
        answerId: groupKeyExpanded ? groupKeyExpanded.answerId : null
    })

    let tekst = '';

    useEffect(() => {
        (async () => {
            if (!groupNodeReLoading) {
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
                    else if (groupId_answerId !== groupId_answerId_done) { //} && !groupNodeLoaded) {
                        const arr = groupId_answerId.split('_');
                        const groupId = arr[0];
                        const answerId = arr[1];
                        const keyExp = { partitionKey: null, id: groupId, answerId }
                        // setCatKeyExpanded(keyExp);
                        console.log('zovem reloadGroupNode 1111111111111111111)', { groupId_answerId }, { groupId_answerId_done })
                        await reloadGroupNode(keyExp, fromChatBotDlg ?? 'false')
                            .then(() => { return null; });
                    }
                }
                else if (groupKeyExpanded && !groupNodeLoaded) {
                    console.log('zovem reloadGroupNode 2222222222222)', { groupKeyExpanded }, { groupNodeLoaded })
                    await reloadGroupNode(groupKeyExpanded)
                        .then(() => { return null; });
                }
            }
        })()
    }, [groupKeyExpanded, groupNodeReLoading, groupNodeLoaded, reloadGroupNode, groupId_answerId, groupId_answerId_done])

    useEffect(() => {
        setLastRouteVisited(`/groups`);
    }, [setLastRouteVisited])

    useEffect(() => {
        if (!shortGroupsLoaded) {
            loadShortGroups();
        }
    }, [])

    if (groupId_answerId !== 'add_answer') {
        if (/*groupKeyExpanded ||*/ (groupId_answerId && groupId_answerId !== groupId_answerId_done)) {
            console.log("zzzzzz loading...", { groupKeyExpanded, groupId_answerId, groupId_answerId_done })
            return <div>loading...</div>
        }
    }

    console.log('===>>> Groups !!!!!!!!!!!!!!!!!')
    if (!groupNodeLoaded || !shortGroupsLoaded)
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
                                    shortGroups={shortGroups}
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
                            groupKey: shortGroupKeyExpanded,
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
                            <GroupList groupKey={shortGroupKeyExpanded} level={0} title="root" />
                        </div>
                    </Col>
                    <Col xs={0} md={7}>
                        {/* {store.mode === FORM_MODES.ADD && <Add group={group??initialGroup} />} */}
                        {/* <div class="d-none d-lg-block">hide on screens smaller than lg</div> */}
                        <div id='div-details' className="d-none d-md-block">
                            {state.mode === Mode.AddingGroup && <AddGroup groupKey={shortGroupKeyExpanded} inLine={false} />}
                            {state.mode === Mode.ViewingGroup && <ViewGroup inLine={false} />}
                            {state.mode === Mode.EditingGroup && <EditGroup inLine={false} />}
                            {/* {state.mode === FORM_MODES.ADD_ANSWER && <AddAnswer group={null} />} */}
                            {/* TODO check if we set answerId everywhere */}
                            {shortGroupKeyExpanded.answerId && state.mode === Mode.ViewingAnswer &&
                                <ViewAnswer inLine={false} />
                            }
                            {shortGroupKeyExpanded.answerId && state.mode === Mode.EditingAnswer &&
                                <EditAnswer answerKey={{
                                    parentGroup: shortGroupKeyExpanded.id ?? undefined,
                                    partitionKey: shortGroupKeyExpanded.partitionKey,
                                    id: shortGroupKeyExpanded.answerId
                                }}
                                    inLine={false}
                                />
                            }
                        </div>
                    </Col>
                </Row>
            </Container>
            {modalShow &&
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

