import React, { useEffect, useState } from "react";
import { ListGroup } from "react-bootstrap";
import GroupRow from "groups/components/GroupRow";
import { GroupKey, IGroup, IGroupRow, IParentInfo } from "groups/types";
import { useGroupContext } from "groups/GroupProvider";

const GroupList = ({ title, groupRow, level, isExpanded }: IParentInfo) => {

    const { state } = useGroupContext();
    const { groupKeyExpanded } = state;

    const { partitionKey, id, answerId } = groupKeyExpanded
        ? groupKeyExpanded
        : { partitionKey: null, id: null, answerId: null };
    const { groupRows: subGroups } = groupRow;
    //console.log('<<<<<<<<<GroupList', groupRow.id, subGroups )

    return (
        <div className={level! > 1 ? 'ms-2' : ''}>
            <>
                <ListGroup as="ul" variant='dark' className="mb-0">
                    {subGroups!.map((c: IGroupRow) =>
                        <GroupRow
                            //groupRow={{ ...c, isSelected: c.id === id }}
                            groupRow={c}
                            answerId={c.partitionKey === partitionKey && c.id === id ? answerId : null}
                            key={c.id}
                        />
                    )}
                </ListGroup>
                {/* {state.error && state.error} */}
                {/* {state.loading && <div>...loading</div>} */}
            </>
        </div>
    );
};

export default GroupList;
