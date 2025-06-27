import React, { useEffect, useReducer, useState } from "react";
import { ListGroup } from "react-bootstrap";
import ShortGroupRow from "global/Components/SelectShortGroup/ShortGroupRow";
import { ShortGroupsReducer, initialState } from "global/Components/SelectShortGroup/ShortGroupsReducer";
import { IShortGroup, IShortGroupInfo } from "global/types";
import { useGlobalContext } from "global/GlobalProvider";
import { ShortGroupsActionTypes } from "./types";
import { IGroupKey } from "groups/types";

const ShortGroupList = ({ groupKey, level, setParentGroup }: IShortGroupInfo) => {
    const [state, dispatch] = useReducer(ShortGroupsReducer, initialState);
    const { getSubShortGroups } = useGlobalContext();

    const { id } = groupKey ?? { id: null };
    const [shortGroupKey, setShortGroupKey] = useState<IGroupKey|null>(groupKey)

    useEffect(() => {
        (async () => {
            const res = await getSubShortGroups(id);
            const { subShortGroups, parentHeader } = res;
            console.log('getSubShortGroups', groupKey, subShortGroups);
            dispatch({ type: ShortGroupsActionTypes.SET_SUB_SHORTGROUPS, payload: { subShortGroups } });
        })()
    }, [getSubShortGroups, shortGroupKey]);

    //const parentGroup = groupKey.id === 'null' ? null : groupKey.id;
    //const parentGroup = groupKey ? groupKey.id : null;
    const mySubShortGroups = state.shortGroups.filter(c => c.parentGroup === id);
    console.log({ mySubShortGroups })

    const setParentShortGroup = (shortGroup: IShortGroup) => {
        dispatch({ type: ShortGroupsActionTypes.SET_PARENT_SHORTGROUP, payload: { shortGroup } })
        setParentGroup!(shortGroup);
    }

    return (
        <div className={level > 1 ? 'ms-4 h-25' : 'h-25'} style={{ overflowY: 'auto' }}>
            <ListGroup as="ul" variant='dark' className="mb-0">
                {mySubShortGroups.map(shortGroup =>
                    <ShortGroupRow
                        shortGroup={shortGroup}
                        dispatch={dispatch}
                        setParentShortGroup={setParentShortGroup}
                        key={shortGroup.id}
                    />
                )
                }
            </ListGroup>

            {state.error && state.error.message}
        </div>
    );
};

export default ShortGroupList;
