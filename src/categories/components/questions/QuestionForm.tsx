import React, { ChangeEvent, useState } from 'react';
import { useEffect, useRef } from "react";
import { useDebounce } from "@uidotdev/usehooks";
import * as Yup from "yup";
import { useFormik } from "formik";
import { Form, CloseButton, Row, Col, Stack } from "react-bootstrap";
import { CreatedModifiedForm } from "common/CreateModifiedForm"
import { FormButtons } from "common/FormButtons"
import { ActionTypes, FormMode, ICategoryRow, IQuestion, IQuestionFormProps, QuestionKey } from "categories/types";

import { Select } from 'common/components/Select';
import { sourceOptions } from 'common/sourceOptions'
import { statusOptions } from 'common/statusOptions'
import CatList from 'global/Components/SelectCategory/CatList'

import { useCategoryContext, useCategoryDispatch } from "categories/CategoryProvider";
import Dropdown from 'react-bootstrap/Dropdown';
import AssignedAnswers from './AssignedAnswers';
import RelatedFilters from './RelatedFilters';

const QuestionForm = ({ question, submitForm, children, showCloseButton, source = 0, closeModal }: IQuestionFormProps) => {

  // const { globalState } = useGlobalContext();
  // const { isDarkMode, variant, bg } = globalState;

  const { state, onQuestionTitleChanged } = useCategoryContext();
  let { formMode, topRows  } = state;

  const viewing = formMode === FormMode.ViewingQuestion;
  const editing = formMode === FormMode.EditingQuestion;
  const adding = formMode === FormMode.AddingQuestion;

  const isDisabled = viewing;

  const { topId, parentId, id, assignedAnswers, relatedFilters, title: qTitle } = question;
  const questionKey = new QuestionKey(question).questionKey;
  // const categoryKey: ICategoryKey = { topId, parentId, id: parentId! }; // proveri

  const dispatch = useCategoryDispatch();

  const closeForm = () => {
    if (closeModal) {
      closeModal();
    }
    else {
      dispatch({ type: ActionTypes.CLOSE_QUESTION_FORM, payload: { question } })
    }
  }

  const cancelForm = () => {
    if (closeModal) {
      closeModal();
    }
    else {
      dispatch({ type: ActionTypes.CANCEL_QUESTION_FORM, payload: { question } })
    }
  }

  const [searchTerm, setSearchTerm] = useState(id + '/' + qTitle);
  const debouncedSearchTerm = useDebounce(searchTerm, 500);

  const [topRow] = useState<ICategoryRow>(topRows.find(c => c.id === topId)!);

  // eslint-disable-next-line no-self-compare
  const nameRef = useRef<HTMLTextAreaElement>(null);

  const formik = useFormik({
    enableReinitialize: true,
    initialValues: question,
    validationSchema: Yup.object().shape({
      title: Yup.string().required("Required"),
      parentId: Yup.string().required("Required").notOneOf(['000000000000000000000000'])
    }),
    onSubmit: (values: IQuestion) => {
      // console.log('QuestionForm.onSubmit', JSON.stringify(values, null, 2))
      submitForm(values)
      //props.handleClose(false);
      setSearchTerm(values.id + '/' + values.title);
    }
  });

  useEffect(() => {
    const goBre = async () => {
      //if (debouncedSearchTerm && formik.values.title !== debouncedSearchTerm) {
      //if (debouncedSearchTerm && searchTerm !== debouncedSearchTerm) {
      const old = debouncedSearchTerm.split('/');
      const Id = old[0];
      if (formik.values.id === Id) {
        console.log('QuestionForm.useEffect - onQuestioTitleChanged', { debouncedSearchTerm, searchTerm, title: formik.values.title });
        const Title = old[1]
        await onQuestionTitleChanged(topRow, formik.values, Title);
      }
    };
    goBre();
  }, [debouncedSearchTerm, formik.values, onQuestionTitleChanged, searchTerm, topRow]);

  useEffect(() => {
    nameRef.current!.focus();
    if (source !== 0) {
      formik.setFieldValue('source', source)
    }
  }, [formik, nameRef, source])


  const handleChangeTitle = (event: ChangeEvent<HTMLTextAreaElement>) => {
    formik.handleChange(event);
    const value = event.target.value;
    //if (value !== debouncedTitle)
    //setTitle(value);
    setSearchTerm(id +  '/' + value);
  };

  const setParentId = (cat: ICategoryRow) => {
    formik.setFieldValue('parentId', cat.id);
    formik.setFieldValue('categoryTitle', cat.title);
  }

  console.log('@@@@@@@@@@@@@@@@@@@@@ QuestionForm.render: ', { searchTerm, qTitle, debouncedSearchTerm });
  //useEffect(() => {
  //  setSearchTerm(qTitle);
  //}, [qTitle]);

  return (
    <div className="form-wrapper px-3 py-1 my-0 my-1 w-100 question-form" >
      {/* data-bs-theme={`${isDarkMode ? 'dark' : 'light'}`} */}
      {showCloseButton && <CloseButton onClick={closeForm} className="float-end" />}
      <Row className='text-center'>
        <Form.Label>Question  {viewing ? 'Viewing' : editing ? 'Editing' : 'Adding'}</Form.Label>
      </Row>
      <Form onSubmit={formik.handleSubmit}>

        <Stack direction="horizontal" gap={0} className="border">
          <div className="p-0"><Form.Label>Category:</Form.Label></div>
          <div className="p-1">
            <Form.Group controlId="parentId" className="category-select form-select-sm w-90">
              <Dropdown>
                <Dropdown.Toggle variant="light" id="dropdown-basic" className="px-2 py-0 text-primary border" disabled={isDisabled}>
                  <span className="text-wrap me-1">{formik.values.categoryTitle}</span>
                </Dropdown.Toggle>
                <Dropdown.Menu className="p-0 border" >
                  <Dropdown.Item className="p-0 m-0 rounded-3">
                    <CatList
                      selId={formik.values.parentId}
                      categoryKey={null}  // TODO {categoryKey}
                      level={1}
                      setParentId={setParentId}
                    />
                  </Dropdown.Item>
                </Dropdown.Menu>
              </Dropdown>

              <Form.Control
                as="input"
                name="parentId"
                onChange={formik.handleChange}
                //onBlur={formik.handleBlur}
                // onBlur={(e: React.FocusEvent<HTMLTextAreaElement>): void => {
                //   if (isEdit && formik.initialValues.title !== formik.values.title)
                //     formik.submitForm();
                // }}
                value={formik.values.parentId ? formik.values.parentId : ''}
                placeholder='Category'
                className="text-primary w-100"
                disabled={isDisabled}
                hidden={true}
              />
              <Form.Text className="text-danger">
                {formik.touched.parentId && formik.errors.parentId ? (
                  <div className="text-danger">{formik.errors.parentId ? 'required' : ''}</div>
                ) : null}
              </Form.Text>
            </Form.Group>
          </div>
        </Stack>

        <Form.Group controlId="title">
          <Form.Label>Title</Form.Label>
          <Form.Control
            as="textarea"
            name="title"
            placeholder={formik.values.title === "new Question" ? "new Question" : "question text"}
            ref={nameRef}
            onChange={handleChangeTitle}
            // onBlur={formik.handleBlur}
            // onBlur={(e: React.FocusEvent<HTMLTextAreaElement>): void => {
            //   if (isEdit && formik.initialValues.title !== formik.values.title)
            //     formik.submitForm();
            // }}
            value={formik.values.title}
            rows={3}
            className="text-primary w-100"
            disabled={isDisabled}
          />
          <Form.Text className="text-danger">
            {formik.touched.title && formik.errors.title ? (
              <div className="text-danger">{formik.errors.title}</div>
            ) : null}
          </Form.Text>
        </Form.Group>

        <Row>
          <Col>
            <Form.Group controlId="source">
              <Form.Label>Source</Form.Label>
              <Select
                id="source"
                name="source"
                options={sourceOptions}
                onChange={(e, value) => {
                  formik.setFieldValue('source', value)
                  // .then(() => { if (editing) formik.submitForm() })
                }}
                value={formik.values.source}
                disabled={isDisabled}
                classes="text-primary"
              />
              <Form.Text className="text-danger">
                {formik.touched.source && formik.errors.source ? (
                  <div className="text-danger">{formik.errors.source}</div>
                ) : null}
              </Form.Text>
            </Form.Group>
          </Col>
          <Col>
            <Form.Group controlId="status">
              <Form.Label>Status</Form.Label>
              <Select
                id="status"
                name="status"
                options={statusOptions}
                //onChange={formik.handleChange}
                onChange={(e, value) => {
                  formik.setFieldValue('status', value)
                  //.then(() => { if (editing) formik.submitForm() })
                }}
                value={formik.values.status}
                disabled={isDisabled}
                classes="text-primary"
              />
              <Form.Text className="text-danger">
                {formik.touched.status && formik.errors.status ? (
                  <div className="text-danger">{formik.errors.status}</div>
                ) : null}
              </Form.Text>
            </Form.Group>
          </Col>
        </Row>

        {(viewing || editing) &&
          <div className="my-1">
            <AssignedAnswers
              questionKey={questionKey!}
              questionTitle={searchTerm}
              assignedAnswers={assignedAnswers}
              isDisabled={isDisabled}
            />

            <RelatedFilters
              questionKey={questionKey!}
              questionTitle={searchTerm}
              relatedFilters={relatedFilters}
            />

            <CreatedModifiedForm
              created={question.created}
              modified={question.modified}
              classes="text-primary"
            />
          </div>
        }
        {((formik.dirty && editing) || adding) &&
          <FormButtons
            cancelForm={cancelForm}
            handleSubmit={formik.handleSubmit}
            title={children}
          />
        }

        {state.error && <div className="text-danger">{state.error.message}</div>}

      </Form>
    </div >
  );
};

export default QuestionForm;