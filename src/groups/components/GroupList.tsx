import React, { useEffect } from "react";
import { ListGroup } from "react-bootstrap";
import GroupRow from "groups/components/GroupRow";
import { GroupKey, IGroup, IParentInfo } from "groups/types";
import { useGroupContext } from "groups/GroupProvider";


const GroupList = ({ title, groupKey, level }: IParentInfo) => {
    const { state, getSubGroups } = useGroupContext();
    const { groups, groupKeyExpanded } = state;
    // { error, }
    const { partitionKey, id } = groupKey;
    const { answerId } = groupKeyExpanded!;

    useEffect(() => {
        (async () => {
            await getSubGroups(groupKey)
                .then((response: boolean) => {
                });
        })()
    }, [getSubGroups, groupKey]);

    const mySubGroups = groupKey.id === 'null'
        ? groups.filter(c => c.parentGroup === null)
        : groups.filter(c => c.parentGroup === id);
    // console.log("+++++++>>>>>>> GroupList ", { groupKey, mySubGroups });

    return (
        <div className={level! > 1 ? 'ms-2' : ''}>
            <>
                <ListGroup as="ul" variant='dark' className="mb-0 text-info">
                    {mySubGroups.map((c: IGroup) =>
                        <GroupRow
                            group={{ ...c, isSelected: c.id === id }}
                            answerId={answerId}
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
