import React, { forwardRef, useCallback, useEffect, useRef, useState } from "react";
import { GroupKey, IGroup, IGroupRow, ILoadGroupAnswers, IParentInfo, IAnswer, IAnswerKey, IAnswerRow } from "groups/types";
import { useGroupContext } from "groups/GroupProvider";
import useInfiniteScroll from "react-infinite-scroll-hook";
import { List, ListItem, Loading } from "common/components/InfiniteList";
import AnswerRow from "groups/components/answers/AnswerRow";

//const AnswerList = ({ title, groupRow, level }: IParentInfo) => {
const AnswerList = ({ level, groupRow }: { level: number, groupRow: IGroupRow }) => {
    const { state, loadGroupAnswers } = useGroupContext();
    const { groupKeyExpanded, answerLoading, error, activeAnswer } = state;
    const { partitionKey, id, answerId } = groupKeyExpanded
      ? groupKeyExpanded
      : { partitionKey: null, id: null, answerId: null };

    const { answerRows } = groupRow;

    let hasMoreAnswers = false;

    async function loadMore() {
      try {
        // const parentInfo: IParentInfo = {
        //   groupRow,
        //   startCursor: answerRows.length,
        //   includeAnswerId: answerId ?? null
        // }

        const x: ILoadGroupAnswers = {
          groupKey: new GroupKey(groupRow).groupKey!,
          startCursor: answerRows.length,
          includeAnswerId: answerId ?? null
        }
        console.log('^^^^^^^^^^^^^ loadMore')
        console.log('^^^^^^^^^^^^^', { x })
        console.log('^^^^^^^^^^^^^ loadMore')
        await loadGroupAnswers(x);
      }
      catch (error) {
      }
      finally {
      }
    }

    // useEffect(() => {
    //   //if (numOfAnswers > 0 && answerRows.length === 0) { // TODO
    //   if (answerRows.length === 0) { // TODO
    //     loadMore();
    //   }
    // }, [numOfAnswers, answerRows])


    const [infiniteRef, { rootRef }] = useInfiniteScroll({
      loading: answerLoading,
      hasNextPage: hasMoreAnswers!,
      onLoadMore: loadMore,
      disabled: Boolean(error),
      rootMargin: '0px 0px 100px 0px',
    });

    console.log("QQQQQQQQQQQQQQQQQQQQQQQQQQQQQAnswerList", id, answerRows)
    // if (answerLoading)
    //   return <div> ... loading</div>

    return (
      <div
        ref={rootRef}
        className="ms-2" //  border border-1 border-info
        // className="max-h-[500px] max-w-[500px] overflow-auto bg-slate-100"
        style={{ maxHeight: '300px', overflowY: 'auto' }}
      >
        <List>
          {answerRows.length === 0 &&
            <label>No answers</label>
          }
          {answerRows.map((answerRow: IAnswerRow) => {
            return <AnswerRow key={answerRow.id} answerRow={answerRow} />
          })}
          {hasMoreAnswers && (
            <ListItem ref={infiniteRef}>
              <Loading />
            </ListItem>
          )}
        </List>
        {error && <p>Error: {error.message}</p>}
      </div>
    );
  };

export default AnswerList;
