import React, { useEffect, useRef } from "react";
import * as Yup from "yup";
import { useFormik } from "formik";
import { Form, CloseButton, Row, Stack, Dropdown } from "react-bootstrap";
import { CreatedModifiedForm } from "common/CreateModifiedForm"
import { FormButtons } from "common/FormButtons"
import { FormMode, ActionTypes, IGroupFormProps, IGroup, IVariation, IGroupKey, IGroupKeyExpanded } from "groups/types";

import { useGroupDispatch } from "groups/GroupProvider";
import AnswerList from "groups/components/answers/AnswerList";
import { useGlobalContext } from "global/GlobalProvider";
import VariationList from "groups/VariationList";
import { Select } from "common/components/Select";
import { kindOptions } from "common/kindOptions ";

const GroupForm = ({ inLine, mode, group, answerId, submitForm, children }: IGroupFormProps) => {

  const { globalState } = useGlobalContext();
  const { isDarkMode, variant, bg } = globalState;

  const viewing = mode === FormMode.viewing;
  const editing = mode === FormMode.editing;
  const adding = mode === FormMode.adding;

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
    dispatch({ type: ActionTypes.CLOSE_GROUP_FORM })
  }

  const cancelForm = () => {
    dispatch({ type: ActionTypes.CANCEL_GROUP_FORM })
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
        <Form.Label>Group</Form.Label>
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
            placeholder="New Group"
            name="title"
            ref={nameRef}
            onChange={formik.handleChange}
            //onBlur={formik.handleBlur}
            // onBlur={(e: React.FocusEvent<HTMLTextAreaElement>): void => {
            //   if (isEdit && formik.initialValues.title !== formik.values.title)
            //     formik.submitForm();
            // }}
            rows={3}
            className="text-primary w-100"
            value={formik.values.title}
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
            <AnswerList level={1} groupKey={groupKey} title={title} />
          }
        </Form.Group>

        {(viewing || editing) &&
          <CreatedModifiedForm
            created={group.created}
            modified={group.modified}
            classes="text-primary"
          />
        }

        {(editing || adding) &&
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