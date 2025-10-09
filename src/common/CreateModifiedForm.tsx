import React from "react";
import { Container, Row, Col } from "react-bootstrap";
import { formatDate } from 'common/utilities'
import { ICreatedModifiedProps } from './types'

export const CreatedModifiedForm = ({ created, modified, classes }: ICreatedModifiedProps) => {
  
  const txtCreated = created 
    ? `${created.nickName}, ${formatDate(created.time)}`
    : '';
    
  const txtModified = modified
    ? `${modified.nickName}, ${formatDate(modified.time)}`
    : '';

  return (
    <Container className="my-1 created-modified">
      {created &&
        <Row>
          <Col className="px-0 created-modified tttext-muted">
             <div className="">
              <label htmlFor="Created" className="text-secondary">Created</label>
              <input type="input" className="form-control created-modified px-1 py-0 rounded-1" id="Created" disabled value={txtCreated} />
            </div>
          </Col>
        </Row >
      }

      {modified &&
        <Row>
          <Col className="px-0 created-modified tttext-muted">
            <div className="">
              <label htmlFor="Modified" className="text-secondary">Modified</label>
              <input type="input" className="form-control created-modified px-1 py-0 rounded-1" id="Modified" disabled value={txtModified} />
            </div>

            {/* <Form.Group className="tttext-muted">
                <Form.Label>Modified By: </Form.Label>
                <div className="text-muted">{modified.nickName}, {formatDate(modified.time)}</div>
                <div className="p-1 bg-dark text-white">{createdBy}, {formatDate(created.date)}</div>
              </Form.Group> */}
            {/* <FormGroup>
                  <label htmlFor="modifiedBy" className="form-label">Modified By</label>
                  <input name="modifiedBy" defaultValue={modifiedBy} type="text" className="form-control form-control-sm" disabled />
                </FormGroup>

                <Form.Group controlId="modified">
                  <input type="text" defaultValue={formatDate(modified.date)} className="form-control form-control-sm" disabled />
                </Form.Group> */}
          </Col>
        </Row>
      }
    </Container >
  );
};
