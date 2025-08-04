import React, { useEffect, useState } from "react";
import { ListGroup } from "react-bootstrap";
import CategoryRow from "categories/components/CategoryRow";
import { CategoryKey, ICategory, ICategoryRow, IParentInfo } from "categories/types";
import { useCategoryContext } from "categories/CategoryProvider";

const CategoryList = ({ title, categoryRow, isExpanded }: IParentInfo) => {

    const { state } = useCategoryContext();
    const { keyExpanded } = state;
    const { topId, id, questionId } = keyExpanded ?? { topId: '', id: '', questionId: null };

    const { level, categoryRows } = categoryRow;
    console.log('<<<<<<<<< Renderujem CategoryList', categoryRow.id, categoryRows )

    return (
        <div className={level! > 1 ? 'ms-2' : ''} >
            <ListGroup as="ul" variant='dark' className="mb-0 category-bg">
                {categoryRows!.map((c: ICategoryRow) =>
                    <CategoryRow
                        //categoryRow={{ ...c, isSelected: c.id === id }}
                        categoryRow={c}
                        questionId={c.topId === topId && c.id === id ? questionId : null}
                        key={c.id}
                    />
                )}
            </ListGroup>
            {/* {state.error && state.error} */}
            {/* {state.loading && <div>...loading</div>} */}
        </div>
    );
};

export default CategoryList;
