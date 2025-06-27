import * as React from "react";

import { Col, Container, Row } from "react-bootstrap";

interface IAboutShort {
}

const AboutShort: React.FC<IAboutShort> = (props: IAboutShort) => {

  // const { setLastRouteVisited } = useGlobalContext();

  return (
    <Container className="fs-6">

      <div className="d-flex flex-row flex-wrap mx-3">

        <div className="card card-block col-5 m-3" style={{backgroundColor: 'rgb(239, 217, 253)'}}>
          <div className="card-body">
            <h5 className="card-title">Questions &amp; Answers</h5>
            <h6 className="card-subtitle mb-2 text-muted">Build your knowledge base, for sharing information.</h6>
            <p className="card-text">When you record your experiences and insights, other members of your team can share info.</p>
            <p className="card-subtitle mb-2 text-muted">We use MS Azure Platform and Cosmos DB for NoSQL</p>
          </div>
        </div>

        <div className="card card-block col-5 m-3">
          <div className="card-body">
            <h5 className="card-title">Microsoft Azure Cloud Platform</h5>
            <p className="card-text">
              CosmosDB uses Vector Search which is suitable for AI agents.
              Using CosmosDB embeddings we should get a much better query search. <br/>
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

        <div className="card card-block col-5 m-3">
          <div className="card-body">
            <h5 className="card-title">Knowledge is asset for each company</h5>
            <h6 className="card-subtitle mb-2 text-muted">Use our App for maintenace of your Q/A</h6>
            <p className="card-text">
              <ol className="m-3">
                <li>Keeping Q/A at Microsoft Cloud Azure Platform, 
                  you get: Security, Integrity, Backups, Role based authorization ..., without any administration</li>
                <li>Just integrate our <i>'ChatBot JavaScript Library'</i> at your site</li>
              </ol>
            </p>
          </div>
        </div>

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
              <br/>in many cases it would be overkill
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

      </div>
    </Container>
  )
}

export default AboutShort;
