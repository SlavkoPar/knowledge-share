import React from 'react';

import { useGroupContext } from 'groups/GroupProvider'

import { FormMode } from "groups/types";
import GroupForm from "groups/components/GroupForm";

const ViewGroup = ({ inLine }: { inLine: boolean }) => {
    const { state } = useGroupContext();
    const { activeGroup, keyExpanded: groupKeyExpanded } = state;
    const { answerId } = groupKeyExpanded!;
    return (
        <GroupForm
            inLine={inLine}
            group={{ ...activeGroup! }}
            answerId={answerId}
            formMode={FormMode.ViewingGroup}
            submitForm={() => { }}
        >
            View Group
        </GroupForm>
    );
}

export default ViewGroup;
