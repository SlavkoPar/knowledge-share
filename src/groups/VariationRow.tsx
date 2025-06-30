import React from 'react';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faEdit, faRemove, faThumbsUp, faPlus, faReply } from '@fortawesome/free-solid-svg-icons'

import { ListGroup, Button, Badge } from "react-bootstrap";

import { useGlobalState } from 'global/GlobalProvider'
import { ActionTypes, IGroupInfo, IGroupKey, FormMode } from "groups/types";
import { useGroupContext, useGroupDispatch } from 'groups/GroupProvider'
import { useHover } from 'hooks/useHover';
import { IVariation } from 'groups/types'

// import AddTag from "groups/components/tags/AddTag";
// import EditTag from "groups/components/tags/EditTag";
// import ViewTag from "groups/components/tags/ViewTag";

//const TagRow = ({ tag, groupInAdding }: { ref: React.ForwardedRef<HTMLLIElement>, tag: IVariation, groupInAdding: boolean | undefined }) => {
const VariationRow = ({ groupKey, tag, groupInAdding }: { groupKey: IGroupKey, tag: IVariation, groupInAdding: boolean | undefined }) => {
    const { partitionKey, id } = groupKey;
    const { name } = tag;
    const { parentGroup, level, inViewing, inEditing, inAdding, numOfTags } = {
        parentGroup: '',
        level: 0,
        inViewing: false,
        inEditing: false,
        inAdding: false,
        numOfTags: 4
    };

    const { canEdit, isDarkMode, variant, bg } = useGlobalState();

    // const { state, viewTag, editTag, deleteTag } = useGroupContext();
    const { state, deleteGroupVariation } = useGroupContext();
    const dispatch = useGroupDispatch();

    const alreadyAdding = false //state.mode === Mode.AddingTag;

    const del = () => {
        deleteGroupVariation(groupKey, name);
    };

    const edit = (id: number) => {
        // Load data from server and reinitialize tag
        //editTag(id);
    }

    const onSelectTag = (id: number) => {
        // Load data from server and reinitialize tag
        //if (canEdit)
        //editTag(id);
        //else
        //viewTag(id);
    }

    const [hoverRef, hoverProps] = useHover();

    const Row1 =
        // <div ref={hoverRef} className="d-flex justify-content-start align-items-center text-secondary">
        <div ref={hoverRef}>

            <Badge pill bg="secondary">
                {/* className={`text-info ${numOfTags === 0 ? 'd-none' : 'd-inline'}`} */}
                {name}
            </Badge>

            {/* <Button
                variant='link'
                size="sm"
                className={`py-0 mx-0 text-decoration-none text-secondary ${(inViewing || inEditing) ? 'fw-bold' : ''}`}
                title={`id:${id!.toString()}`}
                onClick={() => onSelectTag(id!)}
                disabled={alreadyAdding}
            >
                {name}
            </Button> */}

            {/* {canEdit && !alreadyAdding && hoverProps.isHovered &&
                <Button variant='link' size="sm" className="ms-1 py-0 px-1 text-secondary"
                    //onClick={() => { dispatch({ type: ActionTypes.EDIT, tag }) }}>
                    onClick={() => edit(_id!)}
                >
                    <FontAwesomeIcon icon={faEdit} size='lg' />
                </Button>
            } */}

            {canEdit && !alreadyAdding && hoverProps.isHovered &&
                <Button variant='link' size="sm" className="ms-0 py-0 mx-0 text-secondary"
                    onClick={del}
                >
                    <FontAwesomeIcon icon={faRemove} size='sm' />
                </Button>
            }

            {false && canEdit && !alreadyAdding && hoverProps.isHovered &&
                <Button
                    variant='link'
                    size="sm"
                    className="ms-2 py-0 mx-1 text-secondary"
                    title="Add Tag"
                    onClick={() => {
                        console.log('click q')
                        const groupInfo: IGroupInfo = { groupKey: { partitionKey, id }, level }
                        //dispatch({ type: ActionTypes.ADD_ANSWER, payload: { groupInfo } })
                    }}
                >
                    <FontAwesomeIcon icon={faPlus} size='lg' />
                    <FontAwesomeIcon icon={faThumbsUp} size='lg' style={{ marginLeft: '-5px' }} />
                </Button>
            }
        </div>

    return (

        <div className="py-1 px-1">
            {inAdding && groupInAdding && state.formMode === FormMode.AddingVariation
                ? (
                    // <AddTag tag={tag} inLine={true} showCloseButton={true} />
                    <span>add tag</span>
                )
                : ((inEditing && state.formMode === FormMode.EditingVariation) ||
                    (inViewing && state.formMode === FormMode.ViewingVariation)) ? (
                    <>
                        {/* <div class="d-lg-none">hide on lg and wider screens</div> */}
                        <div id='div-tag' className="ms-0 d-md-none w-100">
                            {/* {inEditing && <EditTag inLine={true} />}
                            {inViewing && <ViewTag inLine={true} />} */}
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
        </div>
    );
};

export default VariationRow;
