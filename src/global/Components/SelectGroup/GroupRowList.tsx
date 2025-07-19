import React, { useEffect, useReducer, useState } from "react";
import { ListGroup } from "react-bootstrap";
import { useGlobalContext } from "global/GlobalProvider";
import { GroupRowsActionTypes, IGroupRowInfo } from "./types";
import { GroupRow, IGroupKey, IGroupRow } from "groups/types";
import { GroupRowsReducer, initialState } from "./GroupRowsReducer";
import SelGroupRow from "./SelGroupRow";

const GroupRowList = ({ groupKey, level, setParentGroup }: IGroupRowInfo) => {
    const [state, dispatch] = useReducer(GroupRowsReducer, initialState);
    const { getGroupRows } = useGlobalContext();

    const { id } = groupKey ?? { id: null };
    const [shortGroupKey, setShortGroupKey] = useState<IGroupKey | null>(groupKey)

    useEffect(() => {
        (async () => {
            const res = await getGroupRows(id);
            const { subGroupRows, parentHeader } = res;
            dispatch({ type: GroupRowsActionTypes.SET_SUB_GROUPS, payload: { subGroupRows } });
        })()
    }, [getGroupRows, shortGroupKey]);

    //const parentId = groupKey.id === 'null' ? null : groupKey.id;
    //const parentId = groupKey ? groupKey.id : null;
    const myGroupRows = state.groupRows.filter(c => c.parentId === id);
    console.log({ mySubShortGroups: myGroupRows })

    const setParentShortGroup = (shortGroup: IGroupRow) => {
        dispatch({ type: GroupRowsActionTypes.SET_PARENT_SHORTGROUP, payload: { shortGroup } })
        setParentGroup!(shortGroup);
    }

    return (

        <div className={level > 1 ? 'border  border-7 ms-4 h-25' : 'border border-7  h-25'} style={{ overflowY: 'auto' }}>
            <ListGroup as="ul" variant='dark' className="mb-0">

                {myGroupRows.map(groupRow =>
                    <SelGroupRow
                        groupRow={groupRow}
                        dispatch={dispatch}
                        setParentGroup={setParentGroup}
                        key={groupRow.id}
                        selId={null}
                    />
                )
                }
            </ListGroup>

            {state.error && state.error.message}
        </div>
    );
};

export default GroupRowList;
