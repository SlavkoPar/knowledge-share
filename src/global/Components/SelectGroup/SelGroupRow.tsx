import React from 'react';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faCaretRight, faCaretDown } from '@fortawesome/free-solid-svg-icons'

import { ListGroup, Button } from "react-bootstrap";

import { useGlobalState } from 'global/GlobalProvider'

import GroupRowList from "global/Components/SelectGroup/GroupRowList";
import { GroupRowsActions, GroupRowsActionTypes } from './types';
import { IGroupRow } from 'groups/types';

interface IShortGroupRow {
    groupRow: IGroupRow;
    selId: string | null;
    dispatch: React.Dispatch<GroupRowsActions>;
    setParentGroup: (groupRow: IGroupRow) => void;
}

const SelGroupRow = ({ groupRow: shortGroup, dispatch, setParentGroup, selId }: IShortGroupRow) => {
    const { topId: topId, id, title, level, isExpanded } = shortGroup;
    const groupKey = { topId, id };

    const { isDarkMode, variant, bg } = useGlobalState();

    const expand = (_id: IDBValidKey) => {
        dispatch({ type: GroupRowsActionTypes.SET_EXPANDED, payload: { id, expanding: !isExpanded } });
    }

    const onSelectShortGroup = (groupRow: IGroupRow) => {
        // Load data from server and reinitialize group
        // viewGroup(id);
        setParentGroup(groupRow);
    }

    const Row1 =
        <div className="d-flex justify-content-start align-items-center w-100 text-primary">
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
                    <GroupRowList
                        selId={selId}
                        level={level + 1}
                        groupKey={groupKey}
                        setParentGroup={setParentGroup}
                    />
                </ListGroup.Item>
            }

        </>
    );
};

export default SelGroupRow;
