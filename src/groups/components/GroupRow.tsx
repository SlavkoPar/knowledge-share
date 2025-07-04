import React, { useCallback, useEffect, useState } from 'react';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faEdit, faRemove, faCaretRight, faCaretDown, faPlus, faFolder } from '@fortawesome/free-solid-svg-icons'
import APlus from 'assets/APlus.png';

import { ListGroup, Button, Badge } from "react-bootstrap";

import { useGlobalState } from 'global/GlobalProvider'
import { ActionTypes, IGroupInfo, IGroupKey, IGroupKeyExpanded, IGroupRow, FormMode, IExpandInfo } from "groups/types";
import { useGroupContext, useGroupDispatch } from 'groups/GroupProvider'
import { useHover } from 'hooks/useHover';
import { IGroup } from 'groups/types'

import GroupList from "groups/components/GroupList";
import EditGroup from "groups/components/EditGroup";
import ViewGroup from "groups/components/ViewGroup";
import AnswerList from './answers/AnswerList';
import AddGroup from './AddGroup';

const GroupRow = ({ groupRow, answerId }: { groupRow: IGroupRow, answerId: string | null }) => {

    const { partitionKey, id, title, level, hasSubGroups, groupRows: subGroups,
        numOfAnswers, answerRows, isExpanded, rootId } = groupRow;

    const groupKey: IGroupKey = { partitionKey, id }

    // const [groupKey] = useState<IGroupKey>({ partitionKey, id }); // otherwise reloads
    const [catKeyExpanded] = useState<IGroupKeyExpanded>({ partitionKey, id, answerId }); // otherwise reloads

    const { canEdit, isDarkMode, variant, bg, authUser } = useGlobalState();

    const { state, addSubGroup, viewGroup, editGroup, deleteGroup, expandGroup, collapseGroup, addAnswer } = useGroupContext();
    let { formMode, keyExpanded: groupKeyExpanded, activeGroup } = state;
    const isSelected = activeGroup !== null && (activeGroup.id === id);
    const showForm = isSelected;


    const alreadyAdding = formMode === FormMode.AddingGroup;
    // TODO proveri ovo
    const showAnswers = isExpanded && numOfAnswers > 0 // || answers.find(q => q.inAdding) // && !answers.find(q => q.inAdding); // We don't have answers loaded
    console.log("----------------GroupRow", id, numOfAnswers, answerRows, isExpanded)

    const deleteGroupRow = () => {
        groupRow.modified = {
            time: new Date(),
            nickName: authUser.nickName
        }
        deleteGroup(groupRow);
    };

    const handleExpandClick = async () => {
        if (isExpanded)
            await collapseGroup(groupRow);
        else {
            const expandInfo: IExpandInfo = {
                rootId: rootId!,
                groupKey,
                formMode: canEdit ? FormMode.EditingGroup : FormMode.ViewingGroup
            }
            await expandGroup(expandInfo);
        }
    }


    const edit = async () => {
        // Load data from server and reinitialize group
        await editGroup(groupRow, answerId ?? 'null');
    }

    // const onSelectGroup = useCallback(() =>
    //     async (): Promise<any> => {
    //         if (canEdit)
    //             await editGroup(groupRow, answerId ?? 'null');
    //         else
    //             await viewGroup(groupRow, answerId ?? 'null');
    //     }, [])

    const onSelectGroup = async (): Promise<any> => {
        if (canEdit)
            await editGroup(groupRow, answerId ?? 'null');
        else
            await viewGroup(groupRow, answerId ?? 'null');
    }

    useEffect(() => {
        if (numOfAnswers > 0 && !isExpanded) { //!isExpanded && !isSelected) {
            if (groupKeyExpanded && groupKeyExpanded.id === id) { // catKeyExpanded.id) {
                console.log('%%%%%%%%%%%%%%%%%%%%%%%% Zovem iz GroupRow', groupKeyExpanded.id, id)
                if (formMode !== FormMode.AddingGroup) {
                    formMode = FormMode.None
                }
                const expandInfo: IExpandInfo = {
                    rootId: rootId!,
                    groupKey,
                    includeAnswerId: answerId ?? undefined,
                    formMode  // differs from handleExpandClick
                }
                expandGroup(expandInfo);
            }
        }
    }, [id, isExpanded, isSelected, expandGroup, groupKeyExpanded]) // 

    useEffect(() => {
        (async () => {
            if (isSelected) {
                switch (formMode) {
                    case FormMode.ViewingGroup:
                        await viewGroup(groupRow, answerId ?? 'null');
                        break;
                    case FormMode.EditingAnswer:
                        canEdit
                            ? await editGroup(groupRow, answerId ?? 'null')
                            : await viewGroup(groupRow, answerId ?? 'null');
                        break;
                }
            }
        })()
    }, [isSelected]);

    const [hoverRef, hoverProps] = useHover();

    {/* <ListGroup horizontal> */ }
    const Row1 =
        <div ref={hoverRef} className={`d-flex justify-content-start align-items-center w-100 text-primary group-row${isSelected?'-selected':''}`}>
            <Button
                variant='link'
                size="sm"
                className="py-0 px-1  bg-light"
                onClick={(e) => { handleExpandClick(); e.stopPropagation() }}
                title="Expand"
                disabled={alreadyAdding || (!hasSubGroups && numOfAnswers === 0)}
            >
                <FontAwesomeIcon icon={isExpanded ? faCaretDown : faCaretRight} size='lg' />
            </Button>
            <Button
                variant='link'
                size="sm"
                className="py-0 px-1  bg-light"
                // onClick={expand}
                title="Expand"
                disabled={true} //{alreadyAdding || (!hasSubGroups && numOfAnswers === 0)}
            >
                <FontAwesomeIcon icon={faFolder} size='sm' />
            </Button>
            <Button
                variant='link'
                size="sm"
                className={`py-0 mx-0 group-row-title ${isSelected ? 'fw-bold' : ''}`}
                title={id}
                onClick={onSelectGroup}
                disabled={alreadyAdding}
            >
                {title}
            </Button>

            <Badge pill bg="secondary" className={numOfAnswers === 0 ? 'd-none' : 'd-inline'}>
                {numOfAnswers}a
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
                            groupRow.level += 1;
                            addSubGroup(groupRow)

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
                            const groupInfo: IGroupInfo = { groupKey: { partitionKey, id: groupRow.id }, level: groupRow.level }
                            addAnswer(groupKey, rootId!);
                        }}
                    >
                        <img width="22" height="18" src={APlus} alt="Add Answer" />
                    </Button>

                    <Button variant='link' size="sm" className="py-0 mx-1 float-end"
                        disabled={hasSubGroups || numOfAnswers > 0}
                        onClick={deleteGroupRow}
                    >
                        <FontAwesomeIcon icon={faRemove} size='lg' />
                    </Button>
                </div>
            }
        </div>

    return (
        <>
            <ListGroup.Item
                variant={"primary"}
                className="py-0 px-1 w-100"
                as="li"
            >
                {/*inAdding &&*/showForm && formMode === FormMode.AddingGroup &&
                    <>
                        <div className="ms-0 d-md-none w-100">
                            <AddGroup />
                        </div>
                        <div className="d-none d-md-block">
                            {Row1}
                        </div>
                    </>
                }
                {showForm && formMode === FormMode.EditingGroup &&
                    <>
                        {/* <div class="d-lg-none">hide on lg and wider screens</div> */}
                        <div id='divInLine' className="ms-0 d-md-none w-100">
                            {formMode === FormMode.EditingGroup && <EditGroup inLine={false} />}
                        </div>
                        <div className="d-none d-md-block">
                            {Row1}
                        </div>
                    </>
                }

                {showForm && formMode === FormMode.ViewingGroup &&
                    <>
                        {/* <div class="d-lg-none">hide on lg and wider screens</div> */}
                        <div id='divInLine' className="ms-0 d-md-none w-100">
                            <ViewGroup inLine={false} />
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
                            {hasSubGroups &&
                                <GroupList level={level + 1} groupRow={groupRow} title={title} isExpanded={isExpanded} />
                            }
                            {showAnswers &&
                                <AnswerList level={level + 1} groupRow={groupRow} />
                            }
                        </>
                    }

                </ListGroup.Item>
            }
        </>
    );
};

export default GroupRow;
