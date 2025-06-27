import React from 'react';
import { useEffect, useRef } from "react";
import * as Yup from "yup";
import { useFormik } from "formik";
import { Form, CloseButton, Row, Col, Stack } from "react-bootstrap";
import { CreatedModifiedForm } from "common/CreateModifiedForm"
import { FormButtons } from "common/FormButtons"
import { ActionTypes, GroupKey, FormMode, IGroup, IGroupKey, IAnswer, IAnswerFormProps } from "groups/types";

import { Select } from 'common/components/Select';
import { sourceOptions } from 'common/sourceOptions'
import { statusOptions } from 'common/statusOptions'
import ShortGroupList from 'global/Components/SelectShortGroup/ShortGroupList'

import { useGroupContext, useGroupDispatch } from "groups/GroupProvider";
import Dropdown from 'react-bootstrap/Dropdown';
import { useGlobalContext } from 'global/GlobalProvider';
import { IShortGroup } from 'global/types';

const AnswerForm = ({ mode, answer, submitForm, children, showCloseButton, source = 0, closeModal }: IAnswerFormProps) => {

  const { globalState } = useGlobalContext();
  const { isDarkMode, variant, bg } = globalState;

  const { state } = useGroupContext();

  const viewing = mode === FormMode.viewing;
  const editing = mode === FormMode.editing;
  const adding = mode === FormMode.adding;

  const { partitionKey, parentGroup, title, id } = answer;
  const answerKey = { parentGroup: parentGroup ?? undefined, partitionKey, id };
  const groupKey: IGroupKey = { partitionKey, id: parentGroup };

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
      parentGroup: Yup.string().required("Required").notOneOf(['000000000000000000000000'])
    }),
    onSubmit: (values: IAnswer) => {
      // console.log('AnswerForm.onSubmit', JSON.stringify(values, null, 2))
      submitForm(values)
      //props.handleClose(false);
    }
  });

  const isDisabled = mode === FormMode.viewing;

  const setParentGroup = (shortGroup: IShortGroup) => {
    formik.setFieldValue('parentGroup', shortGroup.id);
    formik.setFieldValue('groupTitle', shortGroup.title);
  }

  return (
    <div className="form-wrapper px-3 py-1 my-0 my-1 w-100 bg-info answer-form" >
      {/* data-bs-theme={`${isDarkMode ? 'dark' : 'light'}`} */}
      {showCloseButton && <CloseButton onClick={closeForm} className="float-end" />}
      <Row className='text-center'>
        <Form.Label>Answer</Form.Label>
      </Row>
      <Form onSubmit={formik.handleSubmit}>

        <Stack direction="horizontal" gap={0}>
          <div className="p-0"><Form.Label>Group:</Form.Label></div>
          <div className="p-1">
            <Form.Group controlId="parentGroup" className="group-select form-select-sm">
              <Dropdown>
                <Dropdown.Toggle variant="light" id="dropdown-basic" className="px-2 py-0 text-primary border" disabled={isDisabled}>
                  <span className="text-wrap me-1">{formik.values.groupTitle}</span>
                </Dropdown.Toggle>
                <Dropdown.Menu className="p-0 w-100">
                  <Dropdown.Item className="p-0 m-0 rounded-3 border">
                    <ShortGroupList
                      groupKey={null}  // TODO {groupKey}
                      level={1}
                      setParentGroup={setParentGroup}
                    />
                  </Dropdown.Item>
                </Dropdown.Menu>
              </Dropdown>

              <Form.Control
                as="input"
                name="parentGroup"
                onChange={formik.handleChange}
                //onBlur={formik.handleBlur}
                // onBlur={(e: React.FocusEvent<HTMLTextAreaElement>): void => {
                //   if (isEdit && formik.initialValues.title !== formik.values.title)
                //     formik.submitForm();
                // }}
                value={formik.values.parentGroup ? formik.values.parentGroup : ''}
                placeholder='Group'
                className="text-primary w-100"
                disabled={isDisabled}
                hidden={true}
              />
              <Form.Text className="text-danger">
                {formik.touched.parentGroup && formik.errors.parentGroup ? (
                  <div className="text-danger">{formik.errors.parentGroup ? 'required' : ''}</div>
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
            ref={nameRef}
            onChange={formik.handleChange}
            // onBlur={formik.handleBlur}
            // onBlur={(e: React.FocusEvent<HTMLTextAreaElement>): void => {
            //   if (isEdit && formik.initialValues.title !== formik.values.title)
            //     formik.submitForm();
            // }}
            value={formik.values.title}
            rows={3}
            placeholder='New Answer'
            className="text-primary w-100"
            disabled={isDisabled}
          />
          <Form.Text className="text-danger">
            {formik.touched.title && formik.errors.title ? (
              <div className="text-danger">{formik.errors.title}</div>
            ) : null}
          </Form.Text>
        </Form.Group>

        <Form.Group controlId="link">
          <Form.Label>Link</Form.Label>
          <>
            <Form.Control
              as="input"
              placeholder="link"
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
          </>
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
        {formik.dirty && (editing || adding) &&
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