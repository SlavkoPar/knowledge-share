import React from 'react';
import { useState } from "react";
import { useGroupContext } from 'groups/GroupProvider'
import { useGlobalState } from 'global/GlobalProvider'

import GroupForm from "groups/components/GroupForm";
import InLineGroupForm from "groups/components/InLineGroupForm";
import { FormMode, IGroup, IGroupKey } from "groups/types";

const AddGroup = ({ groupKey, inLine }: { groupKey: IGroupKey, inLine: boolean }) => {
    const globalState = useGlobalState();
    const { nickName } = globalState.authUser;
    const { createGroup, state } = useGroupContext();

    // do not use groupKey
    const group: IGroup = state.groups.find(c => c.isExpanded)!; // .inAdding
    console.assert(group, 'group.inAdding should have been found')

    const [formValues] = useState(group);

    const submitForm = async (groupObject: IGroup) => {
        const object: IGroup = {
            ...groupObject,
            partitionKey: groupKey.partitionKey?? '',  // TODO proveri
            id: groupObject.title.split(' ')[0].toUpperCase(),
            created: {
                time: new Date(),
                nickName: nickName
            },
            modified: undefined
        }
        console.log("**********object", object)
        await createGroup(object);
    }

    return (
        <>
            {/* {inLine ?
                <InLineGroupForm
                    inLine={true}
                    group={formValues}
                    mode={FormMode.adding}
                    submitForm={submitForm}
                >
                    Create
                </InLineGroupForm>
                : */}
                <GroupForm
                    inLine={false}
                    group={formValues}
                    answerId={null}
                    mode={FormMode.adding}
                    submitForm={submitForm}
                >
                    Create Group
                </GroupForm >
            {/* } */}
        </>
    )
}

export default AddGroup
