import React, { useEffect, useReducer, useState } from "react";
import { ListGroup } from "react-bootstrap";
import CatRow from "global/Components/SelectCategory/CatRow";
import { CatReducer, initialState } from "global/Components/SelectCategory/CatReducer";
import { useGlobalContext } from "global/GlobalProvider";
import { CatActionTypes, ICatInfo } from "./types";
import { ICategoryKey, ICategoryRow } from "categories/types";

const CatList = ({ selId, categoryKey, level, setParentId }: ICatInfo) => {
    const [state, dispatch] = useReducer(CatReducer, initialState);
    const { getSubCats } = useGlobalContext();

    const { id } = categoryKey ?? { id: null };
    const [catKey, setCatKey] = useState<ICategoryKey | null>(categoryKey)

    useEffect(() => {
        (async () => {
            const res = await getSubCats(id);
            const { subCats, parentHeader } = res;
            dispatch({ type: CatActionTypes.SET_SUB_CATS, payload: { subCats } });
        })()
    }, [getSubCats, catKey]);

    const mySubCats = state.cats.filter(c => c.parentId === id);

    const setParentCat = (cat: ICategoryRow) => {
        dispatch({ type: CatActionTypes.SET_PARENT_CAT, payload: { cat } })
        setParentId!(cat);
    }

    return (
        <div className={level > 1 ? 'border  border-7 ms-4 h-25' : 'border border-7  h-25'} style={{ overflowY: 'auto' }}>
            <ListGroup as="ul" variant='dark' className="mb-0">
                {mySubCats.filter(c => c.id !== selId).map((cat: ICategoryRow) =>
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
