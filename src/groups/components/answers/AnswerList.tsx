import React, { forwardRef, useCallback, useEffect, useRef, useState } from "react";
import { IGroup, IParentInfo, IAnswer, IAnswerKey, IAnswerRow } from "groups/types";
import { useGroupContext } from "groups/GroupProvider";
import useInfiniteScroll from "react-infinite-scroll-hook";
import { List, ListItem, Loading } from "common/components/InfiniteList";
import AnswerRow from "groups/components/answers/AnswerRow";

const AnswerList = ({ title, groupKey, level }: IParentInfo) => {

  const { state, loadGroupAnswers } = useGroupContext();
  const { groups, groupKeyExpanded, answerLoading, error } = state;

  const group: IGroup = groups.find(c => c.id === groupKey.id)!;
  const { partitionKey, id, answerRows, numOfAnswers, hasMoreAnswers } = group;

  const { answerId } = groupKeyExpanded!;

  console.assert(partitionKey === group.partitionKey);

  console.log('^^^^^^^^^^^^^ AnswerList', answerRows)

  async function loadMore() {
    try {
      const parentInfo: IParentInfo = {
        groupKey,
        startCursor: answerRows.length,
        includeAnswerId: answerId ?? null
      }
      console.log('^^^^^^^^^^^^^ loadMore')
      console.log('^^^^^^^^^^^^^', { parentInfo })
      console.log('^^^^^^^^^^^^^ loadMore')
      await loadGroupAnswers(parentInfo);
    }
    catch (error) {
    }
    finally {
    }
  }

  useEffect(() => {
    if (numOfAnswers > 0 && answerRows.length === 0) { // TODO
      loadMore();
    }
  }, [numOfAnswers])

  const [infiniteRef, { rootRef }] = useInfiniteScroll({
    loading: answerLoading,
    hasNextPage: hasMoreAnswers!,
    onLoadMore: loadMore,
    disabled: Boolean(error),
    rootMargin: '0px 0px 100px 0px',
  });


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
          return <AnswerRow
            key={answerRow.id}
            answerRow={answerRow}
            groupInAdding={group!.isExpanded}  // .inAdding}
          />
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
