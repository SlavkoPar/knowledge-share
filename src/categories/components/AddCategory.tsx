import React from 'react';
import { useState } from "react";
import { useCategoryContext } from 'categories/CategoryProvider'
import { useGlobalState } from 'global/GlobalProvider'

import CategoryForm from "categories/components/CategoryForm";
import { FormMode, ICategory } from "categories/types";

const AddCategory = () => {
    const globalState = useGlobalState();
    const { nickName } = globalState.authUser;
    const { createCategory, state } = useCategoryContext();
    const { activeCategory } = state;

    const [formValues] = useState<ICategory>({ ...activeCategory! });

    const submitForm = async (category: ICategory) => {
        const cat: ICategory = {
            ...category,
            created: {
                time: new Date(),
                nickName: nickName
            },
            modified: undefined
        }
        console.log("**********object", cat)
        await createCategory(cat);
    }

    return (
        <>
            {/* {inLine ?
                <InLineCategoryForm
                    inLine={true}
                    category={formValues}
                    mode={FormMode.adding}
                    submitForm={submitForm}
                >
                    Create
                </InLineCategoryForm>
                : */}
            <CategoryForm
                inLine={false}
                category={formValues}
                questionId={null}
                formMode={FormMode.AddingCategory}
                submitForm={submitForm}
            >
                Create Category
            </CategoryForm >
            {/* } */}
        </>
    )
}

export default AddCategory
