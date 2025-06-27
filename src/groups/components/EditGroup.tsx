import React from 'react';
import { useGroupContext } from 'groups/GroupProvider'
import { useGlobalState } from 'global/GlobalProvider'

import GroupForm from "groups/components/GroupForm";
import { FormMode, IGroup } from "groups/types";

const EditGroup = ({ inLine }: { inLine: boolean }) => {
    const globalState = useGlobalState();
    const { nickName } = globalState.authUser;

    const { state, updateGroup } = useGroupContext();

    const { groups, groupInViewingOrEditing, groupKeyExpanded } = state;
    const { id } = groupInViewingOrEditing!;
    const group = groups.find(c => c.id === id);
    const { answerId } = groupKeyExpanded!;

    const submitForm = async (groupObject: IGroup) => {
        const object: IGroup = {
            ...groupObject,
            created: undefined,
            modified: {
                time: new Date(),
                nickName: nickName
            }
        }
        await updateGroup(object, true /* closeForm */)
    };

    return (
        <GroupForm
            inLine={inLine}
            group={group!}
            answerId={answerId}
            mode={FormMode.editing}
            submitForm={submitForm}
        >
            Update Group
        </GroupForm>
    );
};

export default EditGroup;
