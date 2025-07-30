import React, { useCallback, useEffect, useState } from "react";

import { IAssignedAnswer, ICategory, IQuestion, IQuestionKey } from 'categories/types';
import { useGlobalContext } from "global/GlobalProvider";
import { IAnswer, IAnswerKey } from "groups/types";
import { IWhoWhen } from "global/types";

export interface IChatBotAnswer {
  questionKey?: IQuestionKey;
  topId: string;
  id: string;
  answerTitle: string;
  answerLink: string | null;
  created: IWhoWhen,
  modified: IWhoWhen | null
}

class ChatBotAnswer {
  constructor(assignedAnswer: IAssignedAnswer) {
    const { topId, id, answerTitle, answerLink, created, modified } = assignedAnswer;
    this.chatBotAnswer = {
      topId,
      id,
      answerTitle: answerTitle ?? '',
      answerLink: answerLink ?? '',
      created: assignedAnswer.created!,
      modified: assignedAnswer.modified!
    }
  }
  chatBotAnswer: IChatBotAnswer
}


export interface INewQuestion {
  firstChatBotAnswer: IChatBotAnswer | null;
  hasMoreAnswers: boolean;
}

export interface INextAnswer {
  nextChatBotAnswer: IChatBotAnswer | null; //undefined;
  hasMoreAnswers: boolean;
}

export const useAI = (categories: ICategory[]): [
  (question: IQuestion) => Promise<INewQuestion>,
  () => Promise<IQuestion | null>,
  () => Promise<INextAnswer>] => {


  const [question, setQuestion] = useState<IQuestion | null>(null);
  const [index, setIndex] = useState<number>(0);

  const setNewQuestion = async (q: IQuestion): Promise<INewQuestion> => {
    setQuestion(q);
    let hasMoreAnswers = false;
    let firstChatBotAnswer: IChatBotAnswer | null = null;
    if (q) {
      const { assignedAnswers } = q;
      if (assignedAnswers && assignedAnswers.length > 0) {
        const assignedAnswer = assignedAnswers[0];
        firstChatBotAnswer = new ChatBotAnswer(assignedAnswer).chatBotAnswer;
        hasMoreAnswers = assignedAnswers.length > 1;
        setIndex(0);
      }
    }
    return { firstChatBotAnswer, hasMoreAnswers };
  }

  const getCurrQuestion = useCallback(
    async (): Promise<IQuestion | null> => {
      return question
    }, [question]);


  const getNextChatBotAnswer = useCallback(
    async (): Promise<INextAnswer> => {
      const { assignedAnswers } = question!;
      const len = assignedAnswers.length;
      const i = index + 1;
      if (index + 1 < len) {
        setIndex(i);
        return {
          nextChatBotAnswer: new ChatBotAnswer(assignedAnswers[i]).chatBotAnswer,
          hasMoreAnswers: i + 1 < len
        }
      }
      return { nextChatBotAnswer: null, hasMoreAnswers: false }
    }, [question, index]);

  return [setNewQuestion, getCurrQuestion, getNextChatBotAnswer]
  // useCallback(setNewQuestion, []), 
  // useCallback(getCurrQuestion, [question]), 
  // useCallback(getNextChatBotAnswer, [question])
}
