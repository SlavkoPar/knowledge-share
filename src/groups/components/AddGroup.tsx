import React from 'react';
import { useState } from "react";
import { useGroupContext } from 'groups/GroupProvider'
import { useGlobalState } from 'global/GlobalProvider'

import GroupForm from "groups/components/GroupForm";
import { FormMode, IGroup, IGroupKey } from "groups/types";

const AddGroup = () => {
    const globalState = useGlobalState();
    const { nickName } = globalState.authUser;
    const { createGroup, state } = useGroupContext();
    const { activeGroup } = state;

    const [formValues] = useState<IGroup>({ ...activeGroup! });

    const submitForm = async (group: IGroup) => {
        const cat: IGroup = {
            ...group,
            created: {
                time: new Date(),
                nickName: nickName
            },
            modified: undefined
        }
        console.log("**********object", cat)
        await createGroup(cat);
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
                formMode={FormMode.AddingGroup}
                submitForm={submitForm}
            >
                Create Group
            </GroupForm >
            {/* } */}
        </>
    )
}

export default AddGroup
