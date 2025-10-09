
import { ListGroup, Button, Badge } from "react-bootstrap";

import { useHover } from 'hooks/useHover';
import React from "react";
import { IRelatedFilter } from 'categories/types';
import { formatDate, formatDateShort } from "common/utilities";

interface IProps {
    relatedFilter: IRelatedFilter,
    unAssignFilter: (relatedFilter: IRelatedFilter) => void
}

const RelatedFilter = ({ relatedFilter, unAssignFilter }: IProps) => {

    const { filter, numOfUsages, created, lastUsed } = relatedFilter;

    const { time, nickName } = created!;

    const rowTitle = `Created by: ${nickName}, ${formatDate(new Date(time))}`

    // const { authUser, canEdit, isDarkMode, variant, bg } = useGlobalState();
    // const { state } = useCategoryContext();

    const alreadyAdding = false;

    // const del = () => {
    //     unAssignFilter(relatedFilter);
    // };

    // const edit = (id: number) => {
    //     // Load data from server and reinitialize answer
    //     //editAnswer(id);
    // }

    const onSelectAnswer = (filter: string) => {
        // Load data from server and reinitialize answer
        //viewAnswer(id);
    }

    const [hoverRef] = useHover(); // , hoverProps

    const Row1 =
        <div ref={hoverRef} className="d-flex justify-content-start align-items-center w-100 text-light related-filter-row">
            <Button
                variant='link'
                size="sm"
                className="py-0 mx-0 title text-light text-wrap"
                title={rowTitle}
                onClick={() => onSelectAnswer(filter)}
                disabled={alreadyAdding}
            >
                {filter}
            </Button>

             <Badge pill bg="secondary"  className={`text-light ${numOfUsages === 0 ? 'd-none' : 'd-inline'}`}>
                {numOfUsages}{numOfUsages === 1 ? ' usage' : ' usages'}
                {/* <FontAwesomeIcon icon={faReply} size='sm' /> */}
                {/* <img width="22" height="18" src={A} alt="Answer"></img> */}
            </Badge>

            <span className="small ms-1">
                {formatDateShort(lastUsed!.time)}
            </span>

            {/* {canEdit && !alreadyAdding && hoverProps.isHovered && !isDisabled &&
                <Button variant='link' size="sm" className="ms-1 py-0 mx-1 text-info"
                    onClick={del}
                >
                    <FontAwesomeIcon icon={faRemove} size='lg' />
                </Button>
            } */}
        </div>

    return (
        <ListGroup.Item
            key={filter}
            //variant='secondary'
            className="py-0 px-0"
            as="li"
        >
            {/* <div class="d-lg-none">hide on lg and wider screens</div> */}
            {Row1}
        </ListGroup.Item>

    );
};

export default RelatedFilter;
