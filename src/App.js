import React, { useState } from "react";
import "./styles/App.css";
import "./styles/AppNext.css";
import "./styles/Transitions.css";
import { Route } from "react-router-dom";
import Peer from "simple-peer"
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

  navigator.mediaDevices.getUserMedia({ video: true, audio: true })
  let peer = null
  const [code, setCode] = useState("")
  const [connectionStatus, setConnectionStatus] = useState("Disconnected")
  const startConnection = () => {
    peer = new Peer({ initiator: true, trickle: false, config: { iceServers: [] } })
    peer.on("connect", () => {
      setConnectionStatus("Connected")
    })
    peer.on("close", () => {
      setConnectionStatus("Disconnected")
    })

    peer.on("Error", () => {
      setConnectionStatus("Disconnected")
    })
    peer.on("data", (data) => {
      // ENTRYPOINT TO Intent Detection
    })
    peer.on('signal', data => {
      if (data.type === "offer") {
        setCode(window.location.origin + window.location.pathname + '?' + btoa(JSON.stringify(data))
        )
      }
    })
  }
  const handleQrResult = (data) => {
    if (data) {
      console.log("DATA", data.text)
      console.log(JSON.parse(atob(data.text)))
      peer?.signal(JSON.parse(atob(data.text)))
    }
  }

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
          <Route
            path="/testing"
            render={(props) => <CommandTesting {...props} />}
          />
          <Route
            path="/connect-phone"
            render={(props) => <DesktopRTC {...props} code={code} handleQrResult={handleQrResult} startConnection={startConnection} />}
          />
        </div>
        <StatusBar connectionStatus={connectionStatus} />
      </div>
    </>
  );
}

export default App;
