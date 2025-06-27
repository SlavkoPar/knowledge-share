import React from 'react';
import ReactDOM from 'react-dom/client';
import { BrowserRouter as Router } from 'react-router-dom'

import { PublicClientApplication, EventType, AccountInfo, EventMessage } from '@azure/msal-browser';
import { msalConfig } from './authConfig';

import 'scss/custom.scss'
import 'index.css';
import Main from 'Main';

//import reportWebVitals from './reportWebVitals';

/**
* MSAL should be instantiated outside of the component tree to prevent it from being re-instantiated on re-renders.
* For more, visit: https://github.com/AzureAD/microsoft-authentication-library-for-js/blob/dev/lib/msal-react/docs/getting-started.md
*/
const msalInstance = new PublicClientApplication(msalConfig);
/* await */
await msalInstance.initialize();   //  "target": "es2017", instead of "target": "es5", in tsconfig.json

// Default to using the first account if no account is active on page load
console.log('msalInstance.getAllAccounts().length: ', msalInstance.getAllAccounts().length)
/*
if (!msalInstance.getActiveAccount() && msalInstance.getAllAccounts().length > 0) {
    // Account selection logic is app dependent. Adjust as needed for different use cases.
    const accountInfo: AccountInfo | null = msalInstance.getActiveAccount(); //.getActiveAccount()[0];
    msalInstance.setActiveAccount(accountInfo);
}

// Listen for sign-in event and set active account
msalInstance.addEventCallback((event: EventMessage) => {
    if (event.eventType === EventType.LOGIN_SUCCESS && event.payload) {
        const accountInfo = event.payload as AccountInfo;
        msalInstance.setActiveAccount(accountInfo);
    }
});
*/

//--------------
// Default to using the first account if no account is active on page load
if (!msalInstance.getActiveAccount() && msalInstance.getAllAccounts().length > 0) {
  // Account selection logic is app dependent. Adjust as needed for different use cases.
  msalInstance.setActiveAccount(msalInstance.getAllAccounts()[0]);
}

// Optional - This will update account state if a user signs in from another tab or window
msalInstance.enableAccountStorageEvents();

// Listen for sign-in event and set active account
msalInstance.addEventCallback((event: EventMessage) => {
  //if (event.eventType === EventType.LOGIN_SUCCESS && event.payload.account) {
  if (event.eventType === EventType.LOGIN_SUCCESS && event.payload) {
    const accountInfo = event.payload as AccountInfo;
    console.log('--->>>>>>>> LOGIN_SUCCESS', { accountInfo })
    msalInstance.setActiveAccount(accountInfo);
  }
});
//-----------

const root = ReactDOM.createRoot(
  document.getElementById('root') as HTMLElement
);
root.render(
  // <React.StrictMode>
  <Router>
    <Main instance={msalInstance} />
  </Router>
  // <GlobalProvider>
  //   <Router>
  //     <App />
  //   </Router>
  // </GlobalProvider>
  // </React.StrictMode>
);

// If you want to start measuring performance in your app, pass a function
// to log results (for example: reportWebVitals(console.log))
// or send to an analytics endpoint. Learn more: https://bit.ly/CRA-vitals
// reportWebVitals();
