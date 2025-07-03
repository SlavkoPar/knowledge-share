import React, { forwardRef, useCallback, useEffect, useRef, useState } from "react";
import { CategoryKey, ICategory, ICategoryRow, ILoadCategoryQuestions, IParentInfo, IQuestion, IQuestionKey, IQuestionRow } from "categories/types";
import { useCategoryContext } from "categories/CategoryProvider";
import useInfiniteScroll from "react-infinite-scroll-hook";
import { List, ListItem, Loading } from "common/components/InfiniteList";
import QuestionRow from "categories/components/questions/QuestionRow";

//const QuestionList = ({ title, categoryRow, level }: IParentInfo) => {
const QuestionList = ({ level, categoryRow }: { level: number, categoryRow: ICategoryRow }) => {
  const { state, loadCategoryQuestions } = useCategoryContext();
  const { keyExpanded: categoryKeyExpanded, questionLoading, error, activeQuestion } = state;
  const { partitionKey, id, questionId } = categoryKeyExpanded
    ? categoryKeyExpanded
    : { partitionKey: null, id: null, questionId: null };

  const { questionRows } = categoryRow;

  let hasMoreQuestions = false;

  async function loadMore() {
    try {
      // const parentInfo: IParentInfo = {
      //   categoryRow,
      //   startCursor: questionRows.length,
      //   includeQuestionId: questionId ?? null
      // }

      const x: ILoadCategoryQuestions = {
        categoryKey: new CategoryKey(categoryRow).categoryKey!,
        startCursor: questionRows.length,
        includeQuestionId: questionId ?? null
      }
      console.log('^^^^^^^^^^^^^ loadMore')
      console.log('^^^^^^^^^^^^^', { x })
      console.log('^^^^^^^^^^^^^ loadMore')
      await loadCategoryQuestions(x);
    }
    catch (error) {
    }
    finally {
    }
  }

  // useEffect(() => {
  //   //if (numOfQuestions > 0 && questionRows.length === 0) { // TODO
  //   if (questionRows.length === 0) { // TODO
  //     loadMore();
  //   }
  // }, [numOfQuestions, questionRows])


  const [infiniteRef, { rootRef }] = useInfiniteScroll({
    loading: questionLoading,
    hasNextPage: hasMoreQuestions!,
    onLoadMore: loadMore,
    disabled: Boolean(error),
    rootMargin: '0px 0px 100px 0px',
  });

  console.log("QQQQQQQQQQQQQQQQQQQQQQQQQQQQQQuestionList", id, questionRows)
  // if (questionLoading)
  //   return <div> ... loading</div>

  return (
    <div
      ref={rootRef}
      className="ms-2" //  border border-1 border-info
      // className="max-h-[500px] max-w-[500px] overflow-auto bg-slate-100"
      style={{ maxHeight: '300px', overflowY: 'auto' }}
    >
      <List>
        {questionRows.length === 0 &&
          <label>No questions</label>
        }
        {questionRows.map((questionRow: IQuestionRow) => {
          return <QuestionRow key={questionRow.id} questionRow={questionRow} />
        })}
        {hasMoreQuestions && (
          <ListItem ref={infiniteRef}>
            <Loading />
          </ListItem>
        )}
      </List>
      {error && <p>Error: {error.message}</p>}
    </div>
  );
};

export default QuestionList;
