import React from 'react';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faCaretRight, faCaretDown } from '@fortawesome/free-solid-svg-icons'

import { ListGroup, Button } from "react-bootstrap";

import { useGlobalState } from 'global/GlobalProvider'
import { IShortGroup } from "global/types";

import ShortGroupList from "global/Components/SelectShortGroup/ShortGroupList";
import { ShortGroupsActions, ShortGroupsActionTypes } from './types';

interface IShortGroupRow {
    shortGroup: IShortGroup;
    dispatch: React.Dispatch<ShortGroupsActions>;
    setParentShortGroup: (shortGroup: IShortGroup) => void;
}

const ShortGroupRow = ({ shortGroup , dispatch, setParentShortGroup }: IShortGroupRow) => {
    const { partitionKey, id, title, level, isExpanded } = shortGroup;
    const groupKey = { partitionKey, id };

    const { isDarkMode, variant, bg } = useGlobalState();

    const expand = (_id: IDBValidKey) => {
        dispatch({ type: ShortGroupsActionTypes.SET_EXPANDED, payload: { id, expanding: !isExpanded } });
    }

    const onSelectShortGroup = (shortGroup: IShortGroup) => {
        // Load data from server and reinitialize group
        // viewGroup(id);
        setParentShortGroup(shortGroup);
    }

    const Row1 =
        <div className="d-flex justify-content-start align-items-center text-primary">
            <Button
                variant='link'
                size="sm"
                className="py-0 px-1"
                onClick={(e) => {
                    expand(id!);
                    e.stopPropagation();
                }}
                title="Expand"
            >
                <FontAwesomeIcon icon={isExpanded ? faCaretDown : faCaretRight} size='lg' />
            </Button>
            <Button
                variant='link'
                size="sm"
                className={`py-0 mx-0 text-decoration-none`}
                title={id}
                onClick={() => onSelectShortGroup(shortGroup)}
            >
                {title.substring(0, 25) + ' ...'}
            </Button>
        </div>

    return (
        <>
            <ListGroup.Item
                variant={"primary"}
                className="py-0 px-1"
                as="li"
            >
                {Row1}
            </ListGroup.Item>

            {isExpanded && // Row2
                <ListGroup.Item
                    className="py-0 px-0"
                    variant={"primary"}
                    as="li"
                >
                    <ShortGroupList
                        level={level + 1}
                        groupKey={groupKey}
                        setParentGroup={setParentShortGroup}
                    />
                </ListGroup.Item>
            }

        </>
    );
};

export default ShortGroupRow;
