import React, { useEffect, useState } from 'react';
import { Container, Row, Col, Button } from "react-bootstrap";
import { Routes, Route, redirect, useLocation, useNavigate } from "react-router-dom";

import { Navigation } from 'Navigation'
import { useGlobalContext, useGlobalDispatch, useGlobalState } from 'global/GlobalProvider'

import './App.css';
import './AutoSuggest.css';

import Categories from "categories/Categories"
//import Groups from "groups/Groups"
import About from 'About';
import Health from 'Health';
import SupportPage from './SupportPage';
import ChatBotPage from './ChatBotPage';
import { GlobalActionTypes, IUser } from 'global/types';
import { AccountInfo } from '@azure/msal-browser';
import { useMsal } from '@azure/msal-react';
import AboutShort from 'AboutShort';
import ChatBotDlg from 'ChatBotDlg';

function App() {
  console.log('-----------> App')

  //const { getUser, OpenDB, setLastRouteVisited } = useGlobalContext();
  const { dbp, authUser, isAuthenticated, everLoggedIn, allCategoryRowsLoaded, allGroupRowsLoaded: groupRowsLoaded, lastRouteVisited, nodesReLoaded } = useGlobalState()
  const { nickName, role } = authUser;

  const formInitialValues = {
    who: '',
    nickName: '',
    email: ''
  };

  let location = useLocation();
  const navigate = useNavigate();
  const dispatch = useGlobalDispatch();

  const { instance } = useMsal();

  const [modalChatBotShow, setModalChatBotShow] = useState(false);

  useEffect(() => {
    //(async () => {
    //if (isAuthenticated) {
    //await OpenDB(execute);
    //}
    //})()
    if (!isAuthenticated) {
      if (instance) {
        const activeAccount: AccountInfo | null = instance.getActiveAccount();
        const name = (activeAccount && activeAccount.name) ? activeAccount.name : 'Unknown';
        const user: IUser = {
          nickName: name,
          name,
          workspace: name === 'Slindza' ? 'SLINDZA' : 'DEMO'
        }
        dispatch({ type: GlobalActionTypes.AUTHENTICATE, payload: { user } });
      }
    }
  }, [dispatch, isAuthenticated]) // , isAuthenticated

  const locationPathname = location.pathname;
  console.log('---------------- ================== App locationPathname ===>>>', locationPathname);

  const searchParams = new URLSearchParams(location.search);

  const showChatBotDlg = (locationPathname.startsWith('/categories') && allCategoryRowsLoaded) ||
    (locationPathname.startsWith('/groups') && groupRowsLoaded);
  useEffect(() => {
    (async () => {
      const isAuthRoute = locationPathname.startsWith('/invitation') ||
        locationPathname.startsWith('/register') ||
        locationPathname.startsWith('/sign-in') ||
        locationPathname.startsWith('/about');  // allow about without registration
      if (!isAuthenticated && !isAuthRoute && dbp) {
        if (everLoggedIn) {
        }
        else {
        }
      }
      else {
      }
      const supporter = searchParams.get('supporter');
      if (isAuthenticated && supporter === '1') {
        const source = searchParams.get('source');
        const question = searchParams.get('subject');
        const email = searchParams.get('email');
        if (!email || email === 'xyz') {
          localStorage.removeItem('emailFromClient')
        }
        else {
          localStorage.setItem('emailFromClient', email ?? 'slavko.parezanin@gmail.com')
        }
        navigate(`/supporter/${source}/${question}`);
      }
    })()
  }, [dbp, isAuthenticated, nickName, everLoggedIn, locationPathname, navigate])

  useEffect(() => {
    console.log('----------->>>>>>>>>> App lastRouteVisited', lastRouteVisited);
    navigate(lastRouteVisited);
  }, [])

  if (!isAuthenticated) // || !categoryRowsLoaded) // || !groupRowsLoaded)
    return <div>App loading</div>

  return (
    <Container fluid className="App" data-bs-theme="light">
      {/* <header className="App-header">
        <Navigation />
      </header> */}
      <Row>
        <Col md={10} className="py-0">
          <div className="wrapper">
            <Routes>
              <Route path="/" element={(!isAuthenticated && !everLoggedIn) ? <AboutShort /> : <Categories />} />
              <Route path="/knowledge-share" element={(!isAuthenticated && !everLoggedIn) ? <AboutShort /> : <Categories />} />
              {/* <Route path="" element={(!isAuthenticated && !everLoggedIn) ? <About /> : <Categories />} /> */}
              {/* <Route path="/register/:returnUrl" element={<RegisterForm />} />
              <Route path="/sign-in" element={<LoginForm initialValues={formInitialValues} invitationId='' />} /> */}
              <Route path="/supporter/:source/:tekst" element={<SupportPage />} />
              <Route path="/supporter/:source/:tekst/:email" element={<SupportPage />} />
              <Route path="/ChatBotPage/:source/:tekst/:email" element={<ChatBotPage />} />
              <Route path="/categories/:categoryId_questionId/:fromChatBotDlg" element={<Categories />} />
              <Route path="/categories" element={<Categories />} />
              {/* <Route path="/groups/:groupId_AnswerId" element={<Groups />} />
              <Route path="/groups" element={<Groups />} /> */}
              <Route path="/about" element={<About />} />
              <Route path="/about-short" element={<AboutShort />} />
              <Route path="/health" element={<Health />} />
            </Routes>
          </div>
        </Col>
      </Row>
      {/* {<ModalChatBot show={modalChatBotShow} onHide={() => { setModalChatBotShow(false) }} />} */}
      {allCategoryRowsLoaded && //nodesReLoaded &&
        <>
          <ChatBotDlg show={modalChatBotShow} onHide={() => { setModalChatBotShow(false) }} />
          <Button onClick={(e) => {
            setModalChatBotShow(!modalChatBotShow);
            e.stopPropagation();
          }}
            className="border rounded-5 me-1 mb-1 buddy-fixed"
          >
            <b>Welcome,</b><br /> I am Stamena,<br /> and You are not.
            <br />I am here to help You!
          </Button>
        </>
      }

    </Container>
  );
}

export default App;
