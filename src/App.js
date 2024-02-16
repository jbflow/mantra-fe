import React from "react";
import "./styles/App.css";
import "./styles/AppNext.css";
import "./styles/Transitions.css";
import { Route } from "react-router-dom";
import CommandBuilder from "./components/CommandBuilder/CommandBuilder";
import AccountManagement from "./components/AccountManagement";
import CommandTesting from "./components/CommandTesting";
import NavBar from "./components/NavBar";
import TopBar from "./components/TopBar";
import Amplify from "aws-amplify";
import StatusBar from "./components/StatusBar";
import DesktopRTC from "./components/DesktopRTC";
// import { MidiContext } from "./contexts/MidiContext";
// import useMIDIMessage from "./hooks/useMIDIMessage";


Amplify.configure({
  Auth: {
    mandatorySignIn: true,
    region: process.env.REACT_APP_AMPLIFY_REGION,
    userPoolId: process.env.REACT_APP_AMPLIFY_USER_POOL_ID,
    identityPoolId: process.env.REACT_APP_AMPLIFY_IDENTITY_POOL_ID,
    userPoolWebClientId: process.env.REACT_APP_AMPLIFY_APP_CLIENT_ID,
  },
  API: {
    endpoints: [
      {
        name: "talkbackBE",
        endpoint: process.env.REACT_APP_HTTP_API_URL,
        region: process.env.REACT_APP_AMPLIFY_REGION,
      },
    ],
  },
});

function App({ signOut }) {
  // const { inputs, outputs } = useContext(MidiContext)
  // const message = useMIDIMessage(inputs[1])
  // useEffect(() => {
  // }, [message])


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

          <DesktopRTC/>
          <Route
            path="/account"
            render={(props) => <AccountManagement {...props} />}
          />
          <Route
            path="/commands"
            render={(props) => <CommandBuilder {...props} />}
          />
          <Route
            path="/testing"
            render={(props) => <CommandTesting {...props} />}
          />
        </div>
        <StatusBar />
      </div>
    </>
  );
}

export default App;
