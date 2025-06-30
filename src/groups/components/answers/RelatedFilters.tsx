import React, { useEffect, useState } from "react";
import { Button, ListGroup, Modal } from "react-bootstrap";
import { IAnswerKey } from "groups/types";
import { useGroupContext } from "groups/GroupProvider";
import { useGlobalContext } from "global/GlobalProvider";
import { IWhoWhen } from "global/types";
import { IRelatedFilter } from "groups/types";
import RelatedFilter from 'groups/components/answers/RelatedFilter'

interface IProps {
    answerKey: IAnswerKey,
    answerTitle: string,
    relatedFilters: IRelatedFilter[]
}

const RelatedFilters = ({ answerKey, answerTitle, relatedFilters }: IProps) => {

    const { globalState } = useGlobalContext();
    const { authUser, isDarkMode, variant, groupRows: shortGroups } = globalState;

    //const [relatedFilters2, setAssignFilters2] = useState<IRelatedFilter[]>([]);

    const [showAdd, setShowAdd] = useState(false);
    const handleClose = () => setShowAdd(false);

    const closeModal = () => {
        handleClose();
    }

    // useEffect(() => {
    //     (async () => {
    //         if (relatedFilters.length > 0) {
    //             //const arr = await joinRelatedFilters(relatedFilters);
    //             setAssignFilters2(relatedFilters);
    //         }
    //     })()
    // }, [relatedFilters])

    const { state } = useGroupContext();
    const [showAssign, setShowAssign] = useState(false);

    const unAssignFilter = async (relatedFilter: IRelatedFilter) => {
        const unAssigned: IWhoWhen = {
            time: new Date(),
            nickName: globalState.authUser.nickName
        }
        //await assignAnswerFilter('UnAssign', answerKey, answerKey, unAssigned);

        // TODO in next version do not update MongoDB immediately, wait until users presses Save
        // User could have canceled answer update
        //setShowAssign(false);
    }

    return (
        <div className='mx-0 my-1 border rounded-2 px-1 py-1 border border-light fs-6 bg-warning'>
            <div>
                <label className="text-muted">Most frequently selected Filters <br />(as the next Answer in ChatBot)</label>
                {relatedFilters.length > 0
                    ? <ListGroup as="ul" variant={variant} className='my-1 bg-secondary'>
                        {relatedFilters.map((relatedFilter: IRelatedFilter) =>
                            <RelatedFilter
                                key={relatedFilter.filter}
                                relatedFilter={relatedFilter}
                                unAssignFilter={unAssignFilter}
                            />)

                        }
                    </ListGroup>
                    : <div className='border text-light'>No filters</div>
                }
                {state.error && <div>state.error</div>}
                {/* {state.loading && <div>...loading</div>} */}
            </div>


        </div>
    );
};

export default RelatedFilters;
