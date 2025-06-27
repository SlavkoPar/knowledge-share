import React from 'react';

import { useGroupContext } from 'groups/GroupProvider'

import { FormMode } from "groups/types";
import GroupForm from "groups/components/GroupForm";

const ViewGroup = ({ inLine }: { inLine: boolean }) => {
    const { state } = useGroupContext();
    const { groups, groupInViewingOrEditing, groupKeyExpanded } = state;
    const { id } = groupInViewingOrEditing!;
    const group = groups.find(c => c.id === id);
    const { answerId } = groupKeyExpanded!;

    return (
        <GroupForm
            inLine={inLine}
            group={group!}
            answerId={answerId}
            mode={FormMode.viewing}
            submitForm={() => { }}
        >
            View Group
        </GroupForm>
    );
}

export default ViewGroup;
