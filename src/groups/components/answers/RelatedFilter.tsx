import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faCopy, faEnvelope, faRemove } from '@fortawesome/free-solid-svg-icons'

import { ListGroup, Button, Modal, Badge } from "react-bootstrap";

import { useGlobalState } from 'global/GlobalProvider'
import { useHover } from 'hooks/useHover';
import { useGroupContext } from "groups/GroupProvider";
import { formatDate, formatDateShort } from 'common/utilities'
import React, { useState } from "react";
import { IRelatedFilter } from 'groups/types';

interface IProps {
    relatedFilter: IRelatedFilter,
    unAssignFilter: (relatedFilter: IRelatedFilter) => void
}

const RelatedFilter = ({ relatedFilter, unAssignFilter }: IProps) => {

    const { filter, numOfUsages, created, lastUsed } = relatedFilter;

    const { time, nickName } = created!;

    const rowTitle = `Created by: ${nickName}, ${formatDate(new Date(time))}`

    const { authUser, canEdit, isDarkMode, variant, bg } = useGlobalState();
    const { state } = useGroupContext();

    const alreadyAdding = false;

    const del = () => {
        unAssignFilter(relatedFilter);
    };

    const edit = (id: number) => {
        // Load data from server and reinitialize answer
        //editAnswer(id);
    }

    const onSelectAnswer = (filter: string) => {
        // Load data from server and reinitialize answer
        //viewAnswer(id);
    }

    const [hoverRef, hoverProps] = useHover();

    const Row1 =
        <div ref={hoverRef} className="d-flex justify-content-start align-items-center w-100 text-light bg-warning">
            <Button
                variant='link'
                size="sm"
                className="py-0 mx-0  text-decoration-none text-light text-wrap bg-warning"
                title={rowTitle}
                onClick={() => onSelectAnswer(filter)}
                disabled={alreadyAdding}
            >
                {filter}
            </Button>

             <Badge pill bg="warning"  className={`text-light ${numOfUsages === 0 ? 'd-none' : 'd-inline'}`}>
                {numOfUsages}{numOfUsages == 1 ? ' usage' : ' usages'}
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
            variant='warning'
            className="py-0 px-0"
            as="li"
        >
            {/* <div class="d-lg-none">hide on lg and wider screens</div> */}
            {Row1}
        </ListGroup.Item>

    );
};

export default RelatedFilter;
