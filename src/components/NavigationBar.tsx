import React from 'react';
import { Link, NavLink, useNavigate } from "react-router-dom";
// import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
// import { faQuestion, faSurprise, faUser, faUserFriends, faReply } from '@fortawesome/free-solid-svg-icons'
import Q from 'assets/Q.png';
import A from 'assets/A.png';


import { AuthenticatedTemplate, UnauthenticatedTemplate, useMsal, useMsalAuthentication, useIsAuthenticated } from '@azure/msal-react';
import { InteractionType, AccountInfo } from "@azure/msal-browser";
import { Navbar, Dropdown, DropdownButton, NavDropdown } from 'react-bootstrap';

import { loginRequest, protectedResources } from 'authConfig';

export const NavigationBar = () => {

    const { instance, accounts, inProgress } = useMsal();

    let activeAccount: AccountInfo | null = null;
    if (instance) {
        activeAccount = instance.getActiveAccount();
        console.log('activeAccount.idTokenClaims.email', activeAccount?.idTokenClaims?.email)
        console.log(activeAccount ? activeAccount.name : 'Unknown')
        console.log({activeAccount})
    }

    const request = {
        loginHint: "name@example.com",
        scopes: protectedResources.KnowledgeAPI.scopes.read
    }
    const { login, result, error: msalError } = useMsalAuthentication(InteractionType.Silent, request);

    let navigate = useNavigate();

    // useEffect(() => {
    //     if (msalError instanceof InteractionRequiredAuthError) {
    //         login(InteractionType.Popup, request);
    //     }
    // }, [msalError]);

    // if (msalError) {
    //     console.log(msalError)
    //     // setError(msalError);
    //     return null;
    // }
    if (result) {
        console.log('result.account.name:', result.account?.name)
        localStorage.setItem('accessToken', result.accessToken);
    }

    const handleLoginRedirect = () => {
        instance.loginRedirect(loginRequest)
            .catch((error) => console.log(error));
    };

    const handleLoginPopup = async () => {
        /**
         * When using popup and silent APIs, we recommend setting the redirectUri to a blank page or a page 
         * that does not implement MSAL. Keep in mind that all redirect routes must be registered with the application
         * For more information, please follow this link: https://github.com/AzureAD/microsoft-authentication-library-for-js/blob/dev/lib/msal-browser/docs/login-user.md#redirecturi-considerations 
         */

        await instance.loginPopup({
            ...loginRequest,
            redirectUri: '/redirect'
        })
            .catch((error) => console.log(error));
    };

    const handleLogoutRedirect = () => {
        instance.logoutRedirect({
            account: instance.getActiveAccount(),
        });
    };

    const handleLogoutPopup = () => {
        instance.logoutPopup({
            mainWindowRedirectUri: '/knowledge-share', // redirects the top level app after logout
            account: instance.getActiveAccount(),
        });
    };

    const handleAbout = () => {
        navigate('/about');
    };


    // if (accounts.length > 0) {
    //     return <span>There are currently {accounts.length} users signed in!</span>
    // } else if (inProgress === "login") {
    //     return <span>Login is currently in progress!</span>
    // }

    /**
     * Most applications will need to conditionally render certain components based on whether a user is signed in or not.
     * msal-react provides 2 easy ways to do this. AuthenticatedTemplate and UnauthenticatedTemplate components will
     * only render their children if a user is authenticated or unauthenticated, respectively.
     */
    console.log('>>>>> activeAccount:', activeAccount)
    return (
        <>
            <Navbar bg="primary" variant="dark" className="navbarStyle">

                <AuthenticatedTemplate>
                    <a className="navbar-brand mx-3" href="/">
                        <i>Knowledge Share</i>
                    </a>
                    <NavLink to="/categories" className="nav-link text-warning">
                        <img width="22" height="20" src={Q} alt="Questions" />{' '}Questions
                    </NavLink>

                    <NavLink to="/groups" className="nav-link text-info">
                        <img width="22" height="20" src={A} alt="Answers" />{' '}Answers
                    </NavLink>

                    {/* <NavLink to={`/supporter/0/${encodeURIComponent('Does Firefox support Manifest 3?')}/xyz`} className="nav-link" */}
                    {/* <NavLink to={`/ChatBotPage/0/${encodeURIComponent('daljinski')}/xyz`} className="nav-link"
                        onClick={() => {
                            //closeQuestionForm();
                        }
                        }>
                        <FontAwesomeIcon icon={faUserFriends} color='lightblue' />{' '}ChatBot
                    </NavLink> */}

                    <div className="collapse navbar-collapse justify-content-end">
                        <DropdownButton
                            variant="warning"
                            drop="start"
                            title={activeAccount ? activeAccount.name : 'Unknown'}
                        >
                            <Dropdown.Item as="button" onClick={handleLogoutPopup}>
                                Sign out using Popup
                            </Dropdown.Item>
                            <Dropdown.Item as="button" onClick={handleLogoutRedirect}>
                                Sign out using Redirect
                            </Dropdown.Item>
                            <NavDropdown.Divider className='mx-2' />
                            <Dropdown.Item as="button" onClick={handleAbout}>
                                <NavDropdown.Item eventKey="DARK_MODE">
                                    Dark mode
                                </NavDropdown.Item>
                                <NavDropdown.Item eventKey="LIGHT_MODE">
                                    Light mode
                                </NavDropdown.Item>

                                <NavDropdown.Divider />

                                <NavDropdown.Item as={Link} to="/health" >
                                    Health
                                </NavDropdown.Item>

                                <NavDropdown.Item as={Link} to="/about" >
                                    About
                                </NavDropdown.Item>
                            </Dropdown.Item>
                        </DropdownButton>
                    </div>
                </AuthenticatedTemplate>
                <UnauthenticatedTemplate>
                    <a className="navbar-brand ms-2" href="/" >
                        Microsoft identity platform (You can sign in with Google)
                    </a>
                    <div className="collapse navbar-collapse justify-content-end">
                        <DropdownButton variant="secondary" className="ml-auto" drop="start" title="Sign In">
                            <Dropdown.Item as="button" onClick={handleLoginPopup}>
                                Sign in using Popup
                            </Dropdown.Item>
                            <Dropdown.Item as="button" onClick={handleLoginRedirect}>
                                Sign in using Redirect
                            </Dropdown.Item>
                        </DropdownButton>
                    </div>
                </UnauthenticatedTemplate>
            </Navbar >
        </>
    );
};