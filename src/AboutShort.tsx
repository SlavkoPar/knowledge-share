import * as React from "react";

import { Accordion, Col, Container, Row } from "react-bootstrap";
import { Link } from "react-router-dom";

interface IAboutShort {
}

const AboutShort: React.FC<IAboutShort> = (props: IAboutShort) => {

  // const { setLastRouteVisited } = useGlobalContext();

  return (
    <Container className="fs-6">

      <div className="d-flex flex-row flex-wrap mx-3">

        <div className="card card-block col-5 m-3" style={{ backgroundColor: 'rgb(239, 217, 253)' }}>
          <div className="card-body">
            <h5 className="card-title">Questions &amp; Answers</h5>
            <h6 className="card-subtitle mb-2 text-muted">Build your knowledge base, for sharing information.</h6>
            <p className="card-text">When you record your experiences and insights, other members of your team can share info.</p>
            <p className="card-subtitle mb-2 text-muted">We use MS Azure Platform and Cosmos DB for NoSQL</p>
            <p> Keeping Q/A at Microsoft Cloud Azure Platform,
              you get: Security, Integrity, Backups, Role based authorization ..., without any administration
            </p>
          </div>
        </div>

        <div className="card card-block col-5 m-3" style={{ backgroundColor: 'rgb(206.6, 226, 254.6)' }}>
          <div className="card-body">
            <h5 className="card-title">Implement Chatbot at your site</h5>
            {/* <h6 className="card-subtitle mb-2 text-muted">Knowledge is asset for each company !</h6> */}
            <h6 className="card-subtitle my-2 text-muted">Three steps:</h6>

            <ol className="my-3">
              <li className="my-1">Create your Workspace at our platform</li>
              <li className="my-1">Use our Web App for maintenace of your Q/A</li>
              <li className="my-1">
                Integrate our KnowledgeLIB<br />
                <i>'ChatBot JavaScript Library'</i> at your site &nbsp;&nbsp;
                <br />
                <a href="https://knowledge-share-demo.com" target="blank">Try it</a>
              </li>
            </ol>
          </div>
        </div>

        <div className="card card-block col-5 m-3">
          <div className="card-body">
            <h5 className="card-title">Microsoft Azure Cloud Platform</h5>
            <p className="card-text">
              CosmosDB uses Vector Search which is suitable for AI agents.
              Using CosmosDB embeddings we should get a much better query search. <br />
              For example, someone can enter one of the following filters, in the question auto-complete:
              <ol>
                <li>"dead remote controller"</li>
                <li>"remote unit does not work"</li>
                <li>"controller doesn't work as expected"</li>
              </ol>
              App will return a similar set of answers for each filter.
              Users can ask questions in a much more natural language form.
            </p>

          </div>
        </div>

        {/* <div className="card card-block col-5 m-3">
          <div className="card-body">
            <h5 className="card-title">Knowledge is asset for each company</h5>
            <h6 className="card-subtitle mb-2 text-muted">Use our App for maintenace of your Q/A</h6>
            <p className="card-text">
              <ol className="m-3">
                <li></li>
                <li>Just integrate our <i>'ChatBot JavaScript Library'</i> at your site</li>
              </ol>
            </p>
          </div>
        </div> */}

        <div className="card card-block col-5 m-3">
          <div className="card-body">
            <h5 className="card-title">Two ways of Hosting</h5>
            {/* <h6 className="card-subtitle mb-2 text-muted">xxxx</h6> */}
            <ul className="card-text">
              <li>
                Self Hosting
                <div>You create your own Azure Account</div>
                <div> We do some initial administration and you can use the appliction</div>
                <div> You continue with administration</div>
              </li>
              <li className="mt-2">
                Shared Hosting
                <div>We create Work Space for your Company</div>
                <div>We create user groups and user accounts</div>
                <div>Role based access rights are supported by Azure platform</div>
              </li>
            </ul>
          </div>
        </div>

        <div className="card card-block col-5 m-3">
          <div className="card-body">
            <h5 className="card-title">AI</h5>
            <h6 className="card-subtitle mb-2 text-muted">Many companies have rounded (limited) Knowledge and want to stay inside of it</h6>
            <p className="card-text">
              Although OpenAI relies on  to dynamically scale their ChatGPT service,
              <br />in many cases it would be overkill
            </p>
          </div>
        </div>

        <div className="card card-block col-5 m-3">
          <div className="card-body">
            <h5 className="card-title">Application is capable of learning</h5>
            <h6 className="card-subtitle mb-2 text-muted">We use history of users interactions, providing:</h6>
            <ul className="card-text">
              <li>Most rated answer for single question</li>
              <li>Most frequently used Question filter in Question AutoSuggest as the next Question</li>
            </ul>
          </div>
        </div>

        <div className="card card-block col-12 m-3">
          <Accordion defaultActiveKey="null">
            <Accordion.Item eventKey="0">
              <Accordion.Header>Integrate KnowledgeLIB at WordPress site</Accordion.Header>
              <Accordion.Body>
                <pre>
                  <div className="bg-warning w-auto"><b>Header</b></div>
                  <code>
                    &lt;link rel="stylesheet" crossorigin <br />
                    &nbsp;&nbsp;&nbsp;href="https://slavkopar.github.io/my-react-app/assets/index.css" /&gt;
                    <br />
                    &lt;base href="https://slavkopar.github.io/my-react-app" /&gt;
                  </code>
                  <br /><br />
                  <div className="bg-warning w-auto" style={{ minWidth: '100%' }}><b>Body</b></div>
                  <code>
                    &lt;div id="root"&gt;&lt;/div&gt;
                  </code>
                  <br /><br />

                  <div className="bg-warning w-auto"><b>Footer</b></div>
                  <code>
                    &lt;script type="module" crossorigin
                    <br />
                    &nbsp;&nbsp;&nbsp;src="https://slavkopar.github.io/my-react-app/assets/index.js"&gt;&lt;/script&gt;
                  </code>
                  <br />
                  <br />
                </pre>
              </Accordion.Body>
            </Accordion.Item>
          </Accordion>
        </div>

        <div className="card card-block col-12 m-3">
          <Accordion defaultActiveKey="null">
            <Accordion.Item eventKey="0">
              <Accordion.Header>Source Code</Accordion.Header>
              <Accordion.Body>
                <ul>
                  <li>
                    <a href="https://github.com/SlavkoPar/NewKnowledgeAPI" target="blank">Core Web API</a>
                  </li>
                  <li>
                    <a href="https://github.com/SlavkoPar/knowledge-share" target="blank">React Single Page App</a>
                  </li>
                  <li>
                    <a href="https://github.com/SlavkoPar/my-react-app" target="blank"><i>KnowledgeLIB</i>&nbsp;&nbsp;JavaScript Library</a>
                  </li>
                </ul>
              </Accordion.Body>
            </Accordion.Item>
          </Accordion>
        </div>

      </div>
    </Container>
  )
}

export default AboutShort;
