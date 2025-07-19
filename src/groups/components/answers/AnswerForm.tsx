import React, { ChangeEvent, useCallback } from 'react';
import { useEffect, useRef } from "react";
import * as Yup from "yup";
import { useFormik } from "formik";
import { Form, CloseButton, Row, Col, Stack } from "react-bootstrap";
import { CreatedModifiedForm } from "common/CreateModifiedForm"
import { FormButtons } from "common/FormButtons"
import { ActionTypes, GroupKey, FormMode, IGroupRow, IGroup, IGroupKey, IAnswer, IAnswerFormProps } from "groups/types";

import { Select } from 'common/components/Select';
import { sourceOptions } from 'common/sourceOptions'
import { statusOptions } from 'common/statusOptions'

import { useGroupContext, useGroupDispatch } from "groups/GroupProvider";
import Dropdown from 'react-bootstrap/Dropdown';
import { useGlobalContext } from 'global/GlobalProvider';
import VariationList from 'groups/VariationList';
import RelatedFilters from './RelatedFilters';
import { debounce } from 'common/utilities';
import GroupRowList from 'global/Components/SelectGroup/GroupRowList';

const AnswerForm = ({ answer, submitForm, children, showCloseButton, source = 0, closeModal }: IAnswerFormProps) => {

  const { globalState } = useGlobalContext();
  const { isDarkMode, variant, bg } = globalState;

  const { state } = useGroupContext();
  let { formMode } = state;

  const viewing = formMode === FormMode.ViewingAnswer;
  const editing = formMode === FormMode.EditingAnswer;
  const adding = formMode === FormMode.AddingAnswer;

  const isDisabled = viewing;

  const { topId: partitionKey, parentId, title, link, id } = answer;
  const answerKey = { parentId: parentId ?? undefined, partitionKey, id };
  const groupKey: IGroupKey = { partitionKey, id: parentId };

  const dispatch = useGroupDispatch();

  const closeForm = () => {
    if (closeModal) {
      closeModal();
    }
    else {
      dispatch({ type: ActionTypes.CLOSE_ANSWER_FORM, payload: { answer } })
    }
  }

  const cancelForm = () => {
    if (closeModal) {
      closeModal();
    }
    else {
      dispatch({ type: ActionTypes.CANCEL_ANSWER_FORM, payload: { answer } })
    }
  }

  // eslint-disable-next-line no-self-compare
  // const nameRef = useRef<HTMLAreaElement | null>(null);
  const nameRef = useRef<HTMLTextAreaElement>(null);
  useEffect(() => {
    nameRef.current!.focus();
    if (source !== 0) {
      formik.setFieldValue('source', source)
    }
  }, [nameRef])

  const formik = useFormik({
    enableReinitialize: true,
    initialValues: answer,
    validationSchema: Yup.object().shape({
      title: Yup.string().required("Required"),
      parentId: Yup.string().required("Required").notOneOf(['000000000000000000000000'])
    }),
    onSubmit: (values: IAnswer) => {
      // console.log('AnswerForm.onSubmit', JSON.stringify(values, null, 2))
      submitForm(values)
      //props.handleClose(false);
    }
  });

  const debouncedTitleHandler = useCallback(
    debounce((groupId: string, id: string, value: string) => {
      dispatch({ type: ActionTypes.ANSWER_TITLE_CHANGED, payload: { groupId, id, value } })
    }, 500), []);

  const handleChangeTitle = (event: ChangeEvent<HTMLTextAreaElement>) => {
    formik.handleChange(event);
    const value = event.target.value;
    debouncedTitleHandler(formik.values.parentId!, id, value)
  };


  const setParentGroup = (cat: IGroupRow) => {
    formik.setFieldValue('parentId', cat.id);
    formik.setFieldValue('groupTitle', cat.title);
  }

  return (
    <div className="form-wrapper px-3 py-1 my-0 my-1 w-100 answer-form" >
      {/* data-bs-theme={`${isDarkMode ? 'dark' : 'light'}`} */}
      {showCloseButton && <CloseButton onClick={closeForm} className="float-end" />}
      <Row className='text-center'>
        <Form.Label>Answer {viewing ? 'Viewing' : editing ? 'Editing' : 'Adding'}</Form.Label>
      </Row>
      <Form onSubmit={formik.handleSubmit}>

        <Stack direction="horizontal" gap={0} className="border">
          <div className="p-0"><Form.Label>Group:</Form.Label></div>
          <div className="p-1">
            <Form.Group controlId="parentId" className="group-select form-select-sm w-90">
              <Dropdown>
                <Dropdown.Toggle variant="light" id="dropdown-basic" className="px-2 py-0 text-primary border" disabled={isDisabled}>
                  <span className="text-wrap me-1">{formik.values.groupTitle}</span>
                </Dropdown.Toggle>
                <Dropdown.Menu className="p-0 border" >
                  <Dropdown.Item className="p-0 m-0 rounded-3">
                    <GroupRowList
                      selId={formik.values.parentId}
                      groupKey={null}  // TODO {groupKey}
                      level={1}
                      setParentGroup={setParentGroup}
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
                placeholder='Group'
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
            placeholder={formik.values.title === "new Answer" ? "new Answer" : "answer text"}
            ref={nameRef}
            onChange={handleChangeTitle}
            // onBlur={formik.handleBlur}
            // onBlur={(e: React.FocusEvent<HTMLTextAreaElement>): void => {
            //   if (isEdit && formik.initialValues.title !== formik.values.title)
            //     formik.submitForm();
            // }}
            value={formik.values.title === "new Answer" ? "" : formik.values.title}
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

        <Form.Group controlId="title">
          <Form.Label>Link</Form.Label>
          <Form.Control
            as="input"
            placeholder="/answers/..."
            name="link"
            onChange={formik.handleChange}
            //onBlur={formik.handleBlur}
            // onBlur={(e: React.FocusEvent<HTMLTextAreaElement>): void => {
            //   if (isEdit && formik.initialValues.title !== formik.values.title)
            //     formik.submitForm();
            // }}
            className="text-primary w-100"
            value={formik.values.link ?? ''}
            disabled={viewing}
          />
          <Form.Text className="text-danger">
            {formik.touched.link && formik.errors.link ? (
              <div className="text-danger">{formik.errors.link}</div>
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
          <>
            <CreatedModifiedForm
              created={answer.created}
              modified={answer.modified}
              classes="text-primary"
            />
          </>
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

export default AnswerForm;