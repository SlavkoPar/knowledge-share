import React, { useEffect, useRef, JSX, ChangeEvent, useCallback, useState } from "react";
import * as Yup from "yup";
import { useFormik } from "formik";
import { Form, CloseButton, Row, Stack, Dropdown } from "react-bootstrap";
import { CreatedModifiedForm } from "common/CreateModifiedForm"
import { FormButtons } from "common/FormButtons"
import { FormMode, ActionTypes, IGroupFormProps, IGroup, IVariation, IGroupKey, IGroupKeyExpanded, GroupRow } from "groups/types";

import { useGroupDispatch } from "groups/GroupProvider";
import AnswerList from "groups/components/answers/AnswerList";
import { useGlobalContext } from "global/GlobalProvider";
import VariationList from "groups/VariationList";
import { Select } from "common/components/Select";
import { kindOptions } from "common/kindOptions ";
import { debounce } from "common/utilities";

const GroupForm = ({ inLine, formMode, group, answerId, submitForm, children }: IGroupFormProps) => {

  const { globalState } = useGlobalContext();
  const { isDarkMode, variant, bg } = globalState;

  const viewing = formMode === FormMode.ViewingGroup;
  const editing = formMode === FormMode.EditingGroup;
  const adding = formMode === FormMode.AddingGroup;

  const { partitionKey, id, title, variations, answerRows, kind } = group;
  const groupKey: IGroupKey = { partitionKey, id };
  const groupKeyExpanded: IGroupKeyExpanded = { partitionKey, id, answerId };

  if (!document.getElementById('div-details')) {

  }
  const showAnswers = answerRows.length > 0 //!answers.find(q => q.inAdding);
  /* 
  We have, at two places:
    <EditGroup inLine={true} />
    <EditGroup inLine={false} />
    so we execute loadGroupAnswers() twice in AnswerList, but OK
  */


  const dispatch = useGroupDispatch();

  const closeForm = () => {
    dispatch({ type: ActionTypes.CLOSE_GROUP_FORM, payload: {} })
  }

  const cancelForm = () => {
    dispatch({ type: ActionTypes.CANCEL_GROUP_FORM, payload: {} })
  }

  const formik = useFormik({
    enableReinitialize: true,
    initialValues: group,
    validationSchema: Yup.object().shape({
      title: Yup.string().required("Required"),
      // email: Yup.string()
      //   .email("You have enter an invalid email address")
      //   .required("Required"),
      // rollno: Yup.number()
      //   .positive("Invalid roll number")
      //   .integer("Invalid roll number")
      //   .required("Required"),
    }),
    onSubmit: (values: IGroup) => {
      //alert(JSON.stringify(values, null, 2));
      console.log('GroupForm.onSubmit', JSON.stringify(values, null, 2))
      submitForm(values)
      //props.handleClose(false);
    }
  });

  
  const debouncedTitleHandler = useCallback(
    debounce((id: string, value: string) => {
      dispatch({ type: ActionTypes.GROUP_TITLE_CHANGED, payload: { id, value } })
    }, 500), []);

  const handleChangeTitle = (event: ChangeEvent<HTMLTextAreaElement>) => {
    formik.handleChange(event);
    const value = event.target.value;
    debouncedTitleHandler(id, value)
  };

  // eslint-disable-next-line no-self-compare
  // const nameRef = useRef<HTMLAreaElement | null>(null);
  const nameRef = useRef<HTMLTextAreaElement>(null);
  //const nameRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    nameRef.current!.focus()
  }, [nameRef])

  const isDisabled = false;

  

  return (
    // data-bs-theme={`${isDarkMode ? 'dark' : 'light'}`}
    <div className="form-wrapper p-2 group-form" >
      <CloseButton onClick={closeForm} className="float-end" />
      <Row className='text-center text-muted'>
        <Form.Label>Group {viewing ? 'Viewing' : editing ? 'Editing' : 'Adding'}</Form.Label>
      </Row>
      <Form onSubmit={formik.handleSubmit}>

        <Form.Group controlId="Variations">
          <Stack direction="horizontal" gap={1}>
            <div className="px-0"><Form.Label>Variations:</Form.Label></div>
            <div className="px-1 border border-1 border-secondary rounded">
              <VariationList groupKey={{ partitionKey, id }} variations={variations.map(variation => ({ name: variation } as IVariation))} />
            </div>
            <div className="ps-2"><Form.Label>Kind:</Form.Label></div>
            <div className="px-1 border border-1 border-secondary rounded">
              <Form.Group controlId="kind">
                {/* <Form.Label>Kind</Form.Label> */}
                <Select
                  id="kind"
                  name="kind"
                  options={kindOptions}
                  onChange={(e, value) => {
                    formik.setFieldValue('kind', value)
                    // .then(() => { if (editing) formik.submitForm() })
                  }}
                  value={formik.values.kind}
                  disabled={isDisabled}
                  classes="text-primary"
                />
                <Form.Text className="text-danger">
                  {formik.touched.kind && formik.errors.kind ? (
                    <div className="text-danger">{formik.errors.kind}</div>
                  ) : null}
                </Form.Text>
              </Form.Group>
            </div>
          </Stack>
        </Form.Group>

        <Form.Group controlId="title">
          <Form.Label>Title</Form.Label>
          <Form.Control
            as="textarea"
            name="title"
            placeholder={formik.values.title === "new Group" ? "new Group" : "group text"}
            ref={nameRef}
            onChange={handleChangeTitle}
            // onChange={(e: any, value: any): {e: ChangeEvent<HTMLTextAreaElement>, value: string} => {
            //         formik.handleChange(e, value);
            //         console.log(value)
            //       }}


            //onBlur={formik.handleBlur}
            // onBlur={(e: React.FocusEvent<HTMLTextAreaElement>): void => {
            //   if (isEdit && formik.initialValues.title !== formik.values.title)
            //     formik.submitForm();
            // }}
            rows={3}
            className="text-primary w-100"
            value={formik.values.title === "new Group" ? "" : formik.values.title}
            disabled={viewing}
          />
          <Form.Text className="text-danger">
            {formik.touched.title && formik.errors.title ? (
              <div className="text-danger">{formik.errors.title}</div>
            ) : null}
          </Form.Text>
        </Form.Group>


        <Form.Group controlId="link">
          <Form.Label>Link</Form.Label>
          {formik.values.hasSubGroups
            ? <Form.Control
              as="input"
              placeholder="/groups/..."
              name="link"
              onChange={formik.handleChange}
              //onBlur={formik.handleBlur}
              // onBlur={(e: React.FocusEvent<HTMLTextAreaElement>): void => {
              //   if (isEdit && formik.initialValues.title !== formik.values.title)
              //     formik.submitForm();
              // }}
              className="text-primary w-100"
              value={"Can't have link (has sub groups)"}
              disabled={true}
            />
            : <>
              <Form.Control
                as="input"
                placeholder="/groups/..."
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
          }
        </Form.Group>

        {/* <Form.Group>
          <Form.Label>Number of Answers </Form.Label>
          <div className="text-secondary">{formik.values.numOfAnswers}</div>
          // <div className="p-1 bg-dark text-white">{createdBy}, {formatDate(created.date)}</div> 
        </Form.Group> */}

        <Form.Group>
          <Form.Label className="m-1 mb-0">Answers ({`${formik.values.numOfAnswers}`}) </Form.Label>
          {showAnswers &&
            <AnswerList level={1} groupRow={group} />  // IGroup extends IGroupRow
          }
        </Form.Group>

        {(viewing || editing) &&
          <CreatedModifiedForm
            created={group.created}
            modified={group.modified}
            classes="text-primary"
          />
        }

        {((formik.dirty && editing) || adding) &&
          <FormButtons
            cancelForm={cancelForm}
            handleSubmit={formik.handleSubmit}
            title={children}
          />
        }
      </Form>
    </div >
  );
};

export default GroupForm;