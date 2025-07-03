import React from 'react';

import { useCategoryContext } from 'categories/CategoryProvider'

import { FormMode } from "categories/types";
import CategoryForm from "categories/components/CategoryForm";

const ViewCategory = ({ inLine }: { inLine: boolean }) => {
    const { state } = useCategoryContext();
    const { activeCategory, keyExpanded: categoryKeyExpanded } = state;
    const { questionId } = categoryKeyExpanded!;
    return (
        <CategoryForm
            inLine={inLine}
            category={{ ...activeCategory! }}
            questionId={questionId}
            formMode={FormMode.ViewingCategory}
            submitForm={() => { }}
        >
            View Category
        </CategoryForm>
    );
}

export default ViewCategory;
