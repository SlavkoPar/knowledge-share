import React, { useEffect, useRef, ChangeEvent, useState } from "react";
import * as Yup from "yup";
import { useFormik } from "formik";
import { Form, CloseButton, Row, Stack } from "react-bootstrap";
import { CreatedModifiedForm } from "common/CreateModifiedForm"
import { FormButtons } from "common/FormButtons"
import { FormMode, ActionTypes, ICategoryFormProps, ICategory, IVariation, ICategoryKey, CategoryKey, ICategoryRow } from "categories/types";

import { useCategoryContext, useCategoryDispatch } from "categories/CategoryProvider";
import QuestionList from "categories/components/questions/QuestionList";
import VariationList from "categories/VariationList";
import { Select } from "common/components/Select";
import { kindOptions } from "common/kindOptions ";
//import { useDebounce } from "hooks/useDebounce";
//import { debounce } from "common/utilities";
import { useDebounce } from "@uidotdev/usehooks";

const CategoryForm = ({ formMode, category, submitForm, children }: ICategoryFormProps) => {

  //const { globalState } = useGlobalContext();
  //const { isDarkMode, variant, bg } = globalState;

  const { state, onCategoryTitleChanged } = useCategoryContext();
  const { topRows } = state;

  const viewing = formMode === FormMode.ViewingCategory;
  const editing = formMode === FormMode.EditingCategory;
  const adding = formMode === FormMode.AddingCategory;

  const { topId, id, variations, questionRows, title: catTitle } = category;
  console.log('CategoryForm render: ', { topId, id, catTitle, formMode })
  const categoryKey: ICategoryKey = new CategoryKey(category).categoryKey!;
  //const categoryKeyExpanded: IQuestionKey = { topId, id, questionId };

  if (!document.getElementById('div-details')) {

  }
  const showQuestions = questionRows.length > 0 //!questions.find(q => q.inAdding);
  /* 
  We have, at two places:
    <EditCategory inLine={true} />
    <EditCategory inLine={false} />
    so we execute loadCategoryQuestions() twice in QuestionList, but OK
  */

  const dispatch = useCategoryDispatch();

  const closeForm = () => {
    dispatch({ type: ActionTypes.CLOSE_CATEGORY_FORM, payload: {} })
  }

  const cancelForm = () => {
    dispatch({ type: ActionTypes.CANCEL_CATEGORY_FORM, payload: {} })
  }

  // const [title, setTitle] = useState(catTitle);
  // const {Id, Value} = useDebounce(id, title, 500);

  const [searchTerm, setSearchTerm] = React.useState(catTitle);
  const debouncedSearchTerm = useDebounce(searchTerm, 300);

  const formik = useFormik({
    enableReinitialize: true,
    initialValues: category,
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
    onSubmit: (values: ICategory) => {
      //alert(JSON.stringify(values, null, 2));
      console.log('CategoryForm.onSubmit', JSON.stringify(values, null, 2))
      submitForm(values);
      //props.handleClose(false);
      setSearchTerm(values.title);
    }
  });


  useEffect(() => {
    const go = async () => {
      if (debouncedSearchTerm && formik.values.title !== debouncedSearchTerm) {
        await onCategoryTitleChanged(formik.values, debouncedSearchTerm);
      }
    };
    go();
  }, [category, debouncedSearchTerm, formik.values, onCategoryTitleChanged]);

  const handleChangeTitle = (event: ChangeEvent<HTMLTextAreaElement>) => {
    formik.handleChange(event);
    const value = event.target.value;
    //if (value !== debouncedTitle)
    //setTitle(value);
    setSearchTerm(value);
  };

  // eslint-disable-next-line no-self-compare
  // const nameRef = useRef<HTMLAreaElement | null>(null);
  const nameRef = useRef<HTMLTextAreaElement>(null);


  useEffect(() => {
    //setTitle(category.title);
    nameRef.current!.focus()
  }, [category.title, nameRef])

  const isDisabled = false;

  return (
    // data-bs-theme={`${isDarkMode ? 'dark' : 'light'}`}
    <div className="form-wrapper p-2 category-form" >
      <CloseButton onClick={closeForm} className="float-end" />
      <Row className='text-center text-muted'>
        <Form.Label>Category {viewing ? 'Viewing' : editing ? 'Editing' : 'Adding'}</Form.Label>
      </Row>
      <Form onSubmit={() => formik.handleSubmit}>

        <Form.Group controlId="Variations">
          <Stack direction="horizontal" gap={1}>
            <div className="px-0"><Form.Label>Variations:</Form.Label></div>
            <div className="px-1 border border-1 border-secondary rounded">
              <VariationList
                categoryKey={categoryKey}
                variations={variations
                  ? variations.map(variation => ({ name: variation } as IVariation))
                  : []
                }
              />
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
            placeholder={formik.values.title === "new Category" ? "new Category" : "category text"}
            value={searchTerm}
            onChange={handleChangeTitle}
            ref={nameRef}
            //onChange={handleChangeTitle}
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
          {formik.values.hasSubCategories
            ? <Form.Control
              as="input"
              placeholder="/categories/..."
              name="link"
              onChange={formik.handleChange}
              //onBlur={formik.handleBlur}
              // onBlur={(e: React.FocusEvent<HTMLTextAreaElement>): void => {
              //   if (isEdit && formik.initialValues.title !== formik.values.title)
              //     formik.submitForm();
              // }}
              className="text-primary w-100"
              value={"Can't have link (has sub categories)"}
              disabled={true}
            />
            : <>
              <Form.Control
                as="input"
                placeholder="/categories/..."
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
          <Form.Label>Number of Questions </Form.Label>
          <div className="text-secondary">{formik.values.numOfQuestions}</div>
          // <div className="p-1 bg-dark text-white">{createdBy}, {formatDate(created.date)}</div> 
        </Form.Group> */}

        <Form.Group>
          <Form.Label className="m-1 mb-0">Questions ({`${formik.values.numOfQuestions}`}) </Form.Label>
          {showQuestions &&
            <QuestionList categoryRow={category} />  // ICategory extends ICategoryRow
          }
        </Form.Group>

        {(viewing || editing) &&
          <CreatedModifiedForm
            created={category.created}
            modified={category.modified}
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

export default CategoryForm;