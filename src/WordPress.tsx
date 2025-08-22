import * as React from "react";

import { Col, Container, Row } from "react-bootstrap";

interface IWP {
}

const WordPress: React.FC<IWP> = (props: IWP) => {

  // const { setLastRouteVisited } = useGlobalContext();

  return (
    <Container className="fs-6">
      <h1>Integrate 'KnowledgeLIB' library at WordPress site</h1>
      <h2>First install WPCode plugin</h2>
      <h2>Add Header and Footer</h2>
      <div className="d-flex flex-row flex-wrap mx-3">

        <div className="card card-block col-5 m-3" style={{ backgroundColor: 'rgb(239, 217, 253)' }}>
          <div className="card-body">
            <h5 className="card-title">Header</h5>
            <p>
              <pre>
              {/* <code> */}
                &lt;link rel="stylesheet" crossorigin href="https://slavkopar.github.io/my-react-app/assets/index.css" /&gt;
                &lt;base href="https://slavkopar.github.io/my-react-app" /&lt;
              {/* </code> */}
              </pre>
            </p>
          </div>
        </div>

      </div>
    </Container>
  )
}

export default WordPress;
