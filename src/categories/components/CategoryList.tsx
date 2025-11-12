import React from "react";
import { ListGroup } from "react-bootstrap";
import CategoryRow from "categories/components/CategoryRow";
import { ICategoryRow, IParentInfo } from "categories/types";
import { useCategoryContext } from "categories/CategoryProvider";

const CategoryList = ({ categoryRow, title }: IParentInfo) => {

    const { state } = useCategoryContext();
    let { keyExpanded } = state;
    const { topId, categoryId: id, questionId } = keyExpanded ?? { topId: '', categoryId: '', questionId: null };

    let level = 1;
    let categoryRows: ICategoryRow[] = [];
    if (title === 'ROOT') {
        categoryRows = state.topRows;
    }
    else {
        categoryRows = categoryRow!.categoryRows;
        level = categoryRow!.level;
    }

    return (
        <div className={level! > 1 ? 'ms-2' : ''} >
            <ListGroup as="ul" variant='dark' className="mb-0 category-bg">
                {categoryRows!.map((c: ICategoryRow) =>
                    <CategoryRow
                        //categoryRow={{ ...c, isSelected: c.id === id }}
                        categoryRow={c}
                        questionId={questionId}
                        // {c.topId === topId && c.id === id ? questionId : null}
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
