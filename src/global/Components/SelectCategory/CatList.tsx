import React, { useEffect, useReducer, useState } from "react";
import { ListGroup } from "react-bootstrap";
import CatRow from "global/Components/SelectCategory/CatRow";
import { CatsReducer, initialState } from "global/Components/SelectCategory/CatsReducer";
import { useGlobalContext } from "global/GlobalProvider";
import { CatsActionTypes, ICatInfo } from "./types";
import { ICategoryKey, ICategoryRow } from "categories/types";

const CatList = ({ selId, categoryKey, level, setParentCategory }: ICatInfo) => {
    const [state, dispatch] = useReducer(CatsReducer, initialState);
    const { getSubCats } = useGlobalContext();

    const { id } = categoryKey ?? { id: null };
    const [catKey, setCatKey] = useState<ICategoryKey|null>(categoryKey)

    useEffect(() => {
        (async () => {
            const res = await getSubCats(id);
            const { subCats, parentHeader } = res;
            console.log('getSubCats', categoryKey, subCats);
            dispatch({ type: CatsActionTypes.SET_SUB_CATS, payload: { subCats } });
        })()
    }, [getSubCats, catKey]);

    //const parentCategory = categoryKey.id === 'null' ? null : categoryKey.id;
    //const parentCategory = categoryKey ? categoryKey.id : null;
    const mySubCats = state.cats.filter(c => c.parentCategory === id);
    console.log({ mySubCategories: mySubCats })

    const setParentCat = (cat: ICategoryRow) => {
        dispatch({ type: CatsActionTypes.SET_PARENT_CAT, payload: { cat } })
        setParentCategory!(cat);
    }

    return (
        <div className={level > 1 ? 'border  border-7 ms-4 h-25' : 'border border-7  h-25'} style={{ overflowY: 'auto' }}>
            <ListGroup as="ul" variant='dark' className="mb-0">
                {mySubCats.filter(c => c.id !== selId).map((cat:ICategoryRow) =>
                    <CatRow
                        cat={cat}
                        selId={selId}
                        dispatch={dispatch}
                        setParentCat={setParentCat}
                        key={cat.id}
                    />
                )
                }
            </ListGroup>

            {state.error && state.error.message}
        </div>
    );
};

export default CatList;
