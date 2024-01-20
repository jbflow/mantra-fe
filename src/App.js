import React from "react";
import "./styles/App.css";
import "./styles/AppNext.css";
import "./styles/Transitions.css";
import { Route } from "react-router-dom";
import Dashboard from "./components/Dashboard/Dashboard";
import CommandBuilder from "./components/CommandBuilder/CommandBuilder";
import AccountManagement from "./components/AccountManagement";
import NavBar from "./components/NavBar";
import TopBar from "./components/TopBar";
import Amplify from "aws-amplify";
import config from "./amplify-config";
import { HTTP_API_URL } from "./utils/Constants";
import StatusBar from "./components/StatusBar";

Amplify.configure({
  Auth: {
    mandatorySignIn: true,
    region: config.cognito.REGION,
    userPoolId: config.cognito.USER_POOL_ID,
    identityPoolId: config.cognito.IDENTITY_POOL_ID,
    userPoolWebClientId: config.cognito.APP_CLIENT_ID,
  },
  API: {
    endpoints: [
      {
        name: "talkbackBE",
        endpoint: HTTP_API_URL,
        region: "eu-west-2",
      },
    ],
  },
});

function App({ signOut }) {
  return (
    <>
      <div>
        <TopBar signOut={signOut} />
        <NavBar />
        <div
          style={{
            paddingTop: 54,
            paddingLeft: 210,
          }}
        >
          

          <Route
            path="/account"
            render={(props) => <AccountManagement {...props} />}
          />
          <Route
            path="/commands"
            render={(props) => <CommandBuilder {...props} />}
          />
        </div>
        <StatusBar />
      </div>
    </>
  );
}

export default App;
