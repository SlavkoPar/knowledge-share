
import React, { useEffect, useState } from 'react';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faEdit, faRemove, faCaretRight, faCaretDown, faPlus, faFolder } from '@fortawesome/free-solid-svg-icons'
import QPlus from 'assets/QPlus.png';

import { ListGroup, Button, Badge } from "react-bootstrap";

import { useGlobalState } from 'global/GlobalProvider'
import { ActionTypes, IGroupInfo, IGroupKey, IGroupKeyExpanded, Mode } from "groups/types";
import { useGroupContext, useGroupDispatch } from 'groups/GroupProvider'
import { useHover } from 'hooks/useHover';
import { IGroup } from 'groups/types'

import GroupList from "groups/components/GroupList";
import EditGroup from "groups/components/EditGroup";
import ViewGroup from "groups/components/ViewGroup";
import AnswerList from './answers/AnswerList';

const GroupRow = ({ group, answerId }: { group: IGroup, answerId: string | null }) => {
    const { partitionKey, id, title, level, hasSubGroups, numOfAnswers, answerRows,
                isExpanded, isSelected } = group;
    const [groupKey] = useState<IGroupKey>({ partitionKey, id }); // otherwise reloads
    const [groupKeyExpanded] = useState<IGroupKeyExpanded>({ partitionKey, id, answerId }); // otherwise reloads

    const { canEdit, isDarkMode, variant, bg, authUser } = useGlobalState();

    const { state, viewGroup, editGroup, deleteGroup, expandGroup, collapseGroup } = useGroupContext();
    //const { mode, groupInViewingOrEditing } = state;
    const { mode } = state;

    //const bold = groupInViewingOrEditing && groupInViewingOrEditing.id === id;

    const dispatch = useGroupDispatch();

    const alreadyAdding = mode === Mode.AddingGroup;
    // TODO proveri ovo
    const showAnswers = (isExpanded && numOfAnswers > 0) // || answers.find(q => q.inAdding) // && !answers.find(q => q.inAdding); // We don't have answers loaded
    
    const del = () => {
        group.modified = {
            time: new Date(),
            nickName: authUser.nickName
        }
        deleteGroup(group);
    };

    const expand = async () => {
        if (isExpanded)
            await collapseGroup(groupKey);
        else
            await expandGroup(groupKey, answerId ?? 'null');
    }

    const edit = async () => {
        // Load data from server and reinitialize group
        await editGroup(groupKey, answerId ?? 'null');
    }

    const onSelectGroup = async () => {
        if (canEdit)
            await editGroup(groupKey, answerId ?? 'null');
        else
            await viewGroup(groupKey, answerId ?? 'null');
    }

    useEffect(() => {
        if (!isExpanded && isSelected) {
            onSelectGroup()
        }
    }, [isExpanded, isSelected])

    const [hoverRef, hoverProps] = useHover();

    {/* <ListGroup horizontal> */ }
    const Row1 =
        <div ref={hoverRef} className="d-flex justify-content-start align-items-center w-100 text-info group-row border">
            <Button
                variant='link'
                size="sm"
                className="py-0 px-1 text-info bg-light"
                onClick={expand}
                title="Expand"
                disabled={alreadyAdding || (!hasSubGroups && numOfAnswers === 0)}
            >
                <FontAwesomeIcon icon={isExpanded ? faCaretDown : faCaretRight} size='lg' />
            </Button>
            <Button
                variant='link'
                size="sm"
                className="py-0 px-1 text-info bg-light"
                onClick={expand}
                title="Expand"
                disabled={alreadyAdding || (!hasSubGroups && numOfAnswers === 0)}
            >
                <FontAwesomeIcon icon={faFolder} size='sm' />
            </Button>
            <Button
                variant='link'
                size="sm"
                className={`py-0 mx-0 text-decoration-none text-info bg-light ${isSelected ? 'fw-bold' : ''}`}
                title={id}
                onClick={onSelectGroup}
                disabled={alreadyAdding}
            >
                {title}
            </Button>

            <Badge pill bg="secondary" className={numOfAnswers === 0 ? 'd-none' : 'd-inline'}>
                {numOfAnswers}Q
                {/* <FontAwesomeIcon icon={faThumbsUp} size='sm' /> */}
                {/* <img width="22" height="18" src={Q} alt="Answer" /> */}
            </Badge>

            {canEdit && !alreadyAdding && hoverProps.isHovered &&
                <>
                    <Button variant='link' size="sm" className="ms-1 py-0 px-0"
                        //onClick={() => { dispatch({ type: ActionTypes.EDIT, group }) }}>
                        onClick={() => edit()}
                    >
                        <FontAwesomeIcon icon={faEdit} size='lg' />
                    </Button>
                    <Button
                        variant='link'
                        size="sm"
                        className="py-0 mx-1 text-primary float-end"
                        title="Add SubGroup"
                        onClick={() => {
                            dispatch({
                                type: ActionTypes.ADD_SUB_GROUP,
                                payload: {
                                    groupKey,
                                    level: group.level + 1
                                }
                            })
                            // if (!isExpanded)
                            //     dispatch({ type: ActionTypes.SET_EXPANDED, payload: { groupKey } });
                        }}
                    >
                        <FontAwesomeIcon icon={faPlus} size='lg' />
                    </Button>
                </>
            }

            {/* TODO what about archive answers  numOfAnswers === 0 &&*/}
            {canEdit && !alreadyAdding && hoverProps.isHovered && !hasSubGroups &&
                <div className="position-absolute d-flex align-items-center top-0 end-0">
                    <Button
                        variant='link'
                        size="sm"
                        className="py-0 mx-1 text-secondary float-end"
                        title="Add Answer"
                        onClick={async () => {
                            const groupInfo: IGroupInfo = { groupKey: {partitionKey, id: group.id}, level: group.level }
                            if (!isExpanded) {
                                await dispatch({ type: ActionTypes.SET_EXPANDED, payload: { groupKey } });
                            }
                            await dispatch({ type: ActionTypes.ADD_ANSWER, payload: { groupInfo } });
                        }}
                    >
                        <img width="22" height="18" src={QPlus} alt="Add Answer" />
                    </Button>

                    <Button variant='link' size="sm" className="py-0 mx-1 float-end"
                        onClick={del}
                    >
                        <FontAwesomeIcon icon={faRemove} size='lg' />
                    </Button>
                </div>
            }
        </div>

    // console.log({ title, isExpanded })

    // if (group.level !== 1)
    //     return (<div>GroupRow {group.id}</div>)

    return (
        <>
            <ListGroup.Item
                variant={"primary"}
                className="py-0 px-1 w-100"
                as="li"
            >
                {/*inAdding && */mode === Mode.AddingGroup ? (
                    // <AddGroup groupKey={groupKey} inLine={true} />
                    <div />
                )
                    : (mode === Mode.EditingGroup || mode === Mode.ViewingGroup) ? (
                        <>
                            {/* <div class="d-lg-none">hide on lg and wider screens</div> */}
                            <div id='divInLine' className="ms-0 d-md-none w-100">
                                {mode === Mode.EditingGroup && <EditGroup inLine={false} />}
                                {mode === Mode.ViewingGroup && <ViewGroup inLine={false} />}
                            </div>
                            <div className="d-none d-md-block">
                                {Row1}
                            </div>
                        </>
                    )
                        : (
                            Row1
                        )
                }
            </ListGroup.Item>

            {state.error && state.whichRowId == id && <div className="text-danger">{state.error.message}</div>}

            {/* !inAdding && */}
            {(isExpanded) && // Row2
                <ListGroup.Item
                    className="py-0 px-0 border-0 border-warning border-bottom-0" // border border-3 "
                    variant={"primary"}
                    as="li"
                >
                    {isExpanded &&
                        <>
                            { hasSubGroups &&
                                <GroupList level={level + 1} groupKey={groupKey} title={title} />
                            }
                            { showAnswers &&
                                <AnswerList level={level + 1} groupKey={groupKey} title={title} />
                            }
                        </>
                    }

                </ListGroup.Item>
            }
        </>
    );
};

export default GroupRow;
