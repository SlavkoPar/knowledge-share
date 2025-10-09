import { IAnswer, IGroup } from "groups/types";

export const initialAnswer: IAnswer = {
  topId: '',
  id: 'will be given by DB',
  parentId: '',
  groupTitle: '',
  title: '',
  link: '',
  source: 0,
  status: 0,
  isSelected: false
}

export const initialGroup: IGroup = {
  topId: 'null',
  id: '',
  kind: 0,
  title: '',
  link: '',
  header: '',
  level: 0,
  variations: [],
  parentId: 'null',
  hasSubGroups: false,
  groupRows: [],
  answerRows: [],
  numOfAnswers: 0,
  hasMoreAnswers: false,
  isExpanded: false,
  doc1: ''
}
