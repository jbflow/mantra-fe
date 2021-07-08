import React from "react";
import "./styles/App.css";
import "./styles/AppNext.css";
import "./styles/Transitions.css";
import { Route, useHistory } from "react-router-dom";
import Dashboard from "./components/Dashboard/Dashboard";
import CommandBuilder from "./components/CommandBuilder/CommandBuilder";
import AccountManagement from "./components/AccountManagement";
import NavBar from "./components/NavBar";
import TopBar from "./components/TopBar";
import Amplify, { API, Auth } from "aws-amplify";
import config from "./amplify-config";
import { HTTP_API_URL } from "./utils/Constants";
import StatusBar from "./components/StatusBar";

import useServices from "./hooks/services/useServices";

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

function App({ signOut, userId }) {
  let history = useHistory();
  const [
    config,
    midiInputOpen,
    midiOutputOpen,
    websocket,
    lastSubject,
    isListening,
    transcript,
  ] = useServices(userId);

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
            path="/dashboard"
            render={(props) => <Dashboard {...props} config={config} />}
          />
          <Route
            path="/account"
            render={(props) => <AccountManagement {...props} userId={userId} />}
          />
          <Route
            path="/commands"
            render={(props) => (
              <CommandBuilder
                {...props}
                ws={websocket}
                config={config}
                userId={userId}
              />
            )}
          />
        </div>
        <StatusBar
          midiInputOpen={midiInputOpen}
          midiOutput={midiOutputOpen}
          isListening={isListening}
          config={config}
          transcript={transcript}
        />
      </div>
    </>
  );
}

export default App;
