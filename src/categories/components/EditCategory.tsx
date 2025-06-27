import React from 'react';
import { useCategoryContext } from 'categories/CategoryProvider'
import { useGlobalState } from 'global/GlobalProvider'

import CategoryForm from "categories/components/CategoryForm";
import { FormMode, ICategory } from "categories/types";

const EditCategory = ({ inLine }: { inLine: boolean }) => {
    const globalState = useGlobalState();
    const { nickName } = globalState.authUser;

    const { state, updateCategory } = useCategoryContext();

    const { activeCategory, categoryKeyExpanded } = state;
    const { questionId } = categoryKeyExpanded!;

    const submitForm = async (categoryObject: ICategory) => {
        const object: ICategory = {
            ...categoryObject,
            created: undefined,
            modified: {
                time: new Date(),
                nickName: nickName
            }
        }
        await updateCategory(object, true /* closeForm */)
    };

    return (
        <CategoryForm
            inLine={inLine}
            category={{ ...activeCategory! }}
            questionId={questionId}
            formMode={FormMode.EditingCategory}
            submitForm={submitForm}
        >
            Update Category
        </CategoryForm>
    );
};

export default EditCategory;
