import * as React from "react";

import imageQuestionForm from 'screenshots/QuestionForm.png'

import image5 from 'screenshots/image5.png'
import image1 from 'screenshots/image1.png'
import image2 from 'screenshots/image2.png'
import image3 from 'screenshots/image3.png'
import image4 from 'screenshots/image4.png'
import { useGlobalContext } from "global/GlobalProvider";

interface IAbout {
}

const About: React.FC<IAbout> = (props: IAbout) => {

  // const { setLastRouteVisited } = useGlobalContext();
  
  return (
    <div className="d-flex flex-column justify-content-center align-items-center text-dark w-75 mx-auto p-1 border">
      <h5>Questions &amp; Answers</h5>
      <div>Build your knowledge base for sharing information.</div>
      <div>When you record your experiences and insights,</div>
      <div>other members of your team can share info.</div>
      
      {/* <div>Visit SupportExt at:</div> */}

      <ul className="d-flex flex-column justify-content-center align-items-center text-info mx-auto p-1 ms-2">
        {/* <li className="p-1">
          <a
            href="https://chrome.google.com/webstore/detail/supportext/fnfimbcgbbcfmlhghmdeclafiengednf?hl=en-GB" 
            title="SupportExt"
            target="_blank"
            rel="noopener noreferrer"
          >
              Chrome web store
          </a>
        </li> */}

        {/* <li className="p-1">
          <a
            href="https://microsoftedge.microsoft.com/addons/detail/supportext/aapkliafbaemkfdkcnlcbhhpjiodnnpb"
            title="SupportExt"
            target="_blank"
            rel="noopener noreferrer"
          >
            Microsoft Edge Add-ons
          </a>
        </li> */}

        {/* <li className="p-1">Video<br />
          <iframe
            title="SupportExt Chrome Extension"
            width="420"
            height="345"
            src="https://www.youtube.com/embed/8rYaTzUQfZA?autoplay=1"
          />
        </li> */}

        <li className="p-1">Question Form<br/>
          <img src={imageQuestionForm} alt="Extension" className="p-1 w-75" />
        </li>


         {/* <li className="p-1">Install SupportExt Chrome Extension, <br />and select Hosting for Web App.<br />Also decide if the Extension forwards 'Email' to the Web App
          <img src={image5} alt="Extension" className="p-1 w-75" />
        </li>
        <li className="p-1">Open the EMail that you have received from client
          <img src={image1} alt="Extension" className="p-1 w-75" />
        </li> */}
        {/*<li className="p-1">Click on <i><b>Support</b></i> icon to forward 'Subject' as the 'Question' to Web app
          <img src={image2} alt="Autocomplete" className="p-1 w-75" />
        </li>
        <li className="p-1">Recognize the best matching question in your Knowledge database
          <img src={image3} alt="Open Question" className="p-1 w-75" />
        </li>
        <li className="p-1">Select 'Answer' and send it in a reply on EMail
          <img src={image4} alt="Select Answer and send it in a reply on Email" className="p-1 w-75" />
        </li> */}
      </ul>
    </div>
  )
}

export default About;
