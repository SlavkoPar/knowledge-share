import React from 'react';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faCaretRight, faCaretDown } from '@fortawesome/free-solid-svg-icons'

import { ListGroup, Button } from "react-bootstrap";

import { useGlobalState } from 'global/GlobalProvider'
import { ICategoryRow } from "categories/types";

import CatList from "global/Components/SelectCategory/CatList";
import { CatsActions, CatsActionTypes } from './types';

interface ICatRow {
    cat: ICategoryRow;
    selId: string | null;
    dispatch: React.Dispatch<CatsActions>;
    setParentCat: (cat: ICategoryRow) => void;
}

const CatRow = ({ cat , dispatch, setParentCat, selId }: ICatRow) => {
    const { partitionKey, id, title, level, isExpanded} = cat;
    const categoryKey = { partitionKey, id };

    const { isDarkMode, variant, bg } = useGlobalState();

    const expand = (_id: IDBValidKey) => {
        dispatch({ type: CatsActionTypes.SET_EXPANDED, payload: { id, expanding: !isExpanded } });
    }

    const onSelectCat = (cat: ICategoryRow) => {
        // Load data from server and reinitialize category
        // viewCategory(id);
        setParentCat(cat);
    }

    const Row1 =
        <div className="d-flex justify-content-start align-items-center w-100 text-primary">
            <Button
                variant='link'
                size="sm"
                className="py-0 px-1"
                onClick={(e) => {
                    expand(id!);
                    e.stopPropagation();
                    e.preventDefault();
                }}
                title="Expand"
            >
                <FontAwesomeIcon icon={isExpanded ? faCaretDown : faCaretRight} size='lg' />
            </Button>
            <Button
                variant='link'
                size="sm"
                className={`py-0 mx-0 text-decoration-none`}
                title={id}
                onClick={() => onSelectCat(cat)}
            >
                {title}
            </Button>
        </div>

    return (
        <>
            <ListGroup.Item
                variant={"primary"}
                className="py-0 px-1 w-100"
                as="li"
            >
                {Row1}
            </ListGroup.Item>

            {isExpanded && // Row2
                <ListGroup.Item
                    className="py-0 px-0"
                    variant={"primary"}
                    as="li"
                >
                    <CatList
                        selId={selId}
                        level={level + 1}
                        categoryKey={categoryKey}
                        setParentCategory={setParentCat}
                    />
                </ListGroup.Item>
            }

        </>
    );
};

export default CatRow;
