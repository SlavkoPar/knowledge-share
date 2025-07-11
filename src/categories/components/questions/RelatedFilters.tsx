import React, { useEffect, useState } from "react";
import { Button, ListGroup, Modal } from "react-bootstrap";
import { IQuestionKey } from "categories/types";
import { useCategoryContext } from "categories/CategoryProvider";
import { useGlobalContext } from "global/GlobalProvider";
import { IWhoWhen } from "global/types";
import { IRelatedFilter } from "categories/types";
import RelatedFilter from 'categories/components/questions/RelatedFilter'

interface IProps {
    questionKey: IQuestionKey,
    questionTitle: string,
    relatedFilters: IRelatedFilter[]
}

const RelatedFilters = ({ questionKey, questionTitle, relatedFilters }: IProps) => {

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

    const { state } = useCategoryContext();
    const [showAssign, setShowAssign] = useState(false);

    const unAssignFilter = async (relatedFilter: IRelatedFilter) => {
        const unAssigned: IWhoWhen = {
            time: new Date(),
            nickName: globalState.authUser.nickName
        }
        //await assignQuestionFilter('UnAssign', questionKey, answerKey, unAssigned);

        // TODO in next version do not update MongoDB immediately, wait until users presses Save
        // User could have canceled question update
        //setShowAssign(false);
    }

    return (
        <div className='mx-0 my-1 border rounded-2 px-1 py-1 border border-light fs-6 related-filters'>
            <div>
                <label className="text-muted">Most frequently selected Filters (as the next Question in ChatBot)</label>
                {relatedFilters.length > 0
                    ? <ListGroup as="ul" variant={variant} className='my-1'>
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
