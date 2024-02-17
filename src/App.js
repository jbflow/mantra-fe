import React, { useState, useContext, useEffect } from "react";
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
import StatusBar from "./components/StatusBar";
import DesktopRTC from "./components/DesktopRTC";

import { MidiContext } from "./contexts/MidiContext";
import useMIDIMessage from "./hooks/useMIDIMessage";



function App({ signOut }) {
  const { midi, dispatch } = useContext(MidiContext)
  const [mainOutput, setMainOutput] = useState(null)
  const [mainInput, setMainInput] = useState(null)
  const message = useMIDIMessage(mainInput)

  const onMIDISuccess = (midiAccess) => {
    const inputs = Array.from(midiAccess.inputs.values())
    const outputs = Array.from(midiAccess.outputs.values())
    setMainInput(inputs.find(input => input.id === midi.mainInput))
    setMainOutput(outputs.find(output => output.id === midi.mainOutput))
    mainInput?.open()
    mainOutput?.open()
  }
  const onMIDIFailure = (e) => {
    console.error(e)
  }

  useEffect(() => {
    if (midi)
      navigator.requestMIDIAccess({ sysex: true }).then(onMIDISuccess, onMIDIFailure);
  }, [midi])

  useEffect(() => {
    console.log("MESSAGE", message)
  }, [message])



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

    peer.on("error", () => {
      setConnectionStatus("Disconnected")
    })
    peer.on("data", (data) => {
      // ENTRYPOINT TO MIDI
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
