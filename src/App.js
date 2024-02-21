import React, { useState, useContext, useEffect } from "react";
import { useHistory } from 'react-router';
import "./styles/App.css";
import "./styles/AppNext.css";
import "./styles/Transitions.css";
import { Route } from "react-router-dom";
import Peer from "simple-peer"
import CommandBuilder from "./components/CommandBuilder/CommandBuilder";
import CommandTesting from "./components/CommandTesting";
import NavBar from "./components/NavBar";
import TopBar from "./components/TopBar";
import StatusBar from "./components/StatusBar";
import DesktopRTC from "./components/DesktopRTC";
import { MidiContext } from "./contexts/MidiContext";
import useMIDIMessage from "./hooks/useMIDIMessage";
import { useMIDIOutput } from "./hooks/useMIDIOutput";
import { STATUS_BYTES } from "./utils/MidiConstants";
import { MANUFACTURER_ID } from "./intent_detection/constants";
import { emptyConfig } from "./utils/MidiConstants";
import { arraysEqual } from "./utils/utils";
import { MidiToJson } from "./utils/MidiToJson";
import Preferences from "./components/Preferences/Preferences";
import VoiceControl from "./components/VoiceControl/VoiceControl";
import { IntentDetection } from "./intent_detection/IntentDetection";
import { TranscriptParser } from "./utils/TranscriptParser";
import * as spdCompact from "sdp-compact";
import { CommandsContext } from "./contexts/CommandsContext";

const options = { compress: true };
const intentDetection = new IntentDetection()
const transcriptParser = new TranscriptParser()


function App({ signOut }) {
  const [alternatives, setAlternatives] = useState([])
  const [transcript, setTranscript] = useState("")
  const [actions, setActions] = useState([])
  const [confirmation, setConfirmation] = useState(false)
  const { midi } = useContext(MidiContext)
  const { commands } = useContext(CommandsContext)
  const [mainOutput, setMainOutput] = useState(null)
  const [mainInput, setMainInput] = useState(null)
  const message = useMIDIMessage(mainInput)
  const { sysex } = useMIDIOutput(mainOutput)
  const [code, setCode] = useState("")
  const [connectionStatus, setConnectionStatus] = useState("Disconnected")
  const routerHistory = useHistory();
  let peer;
  if (!localStorage.getItem("preferences")) {
    localStorage.setItem("preferences", JSON.stringify({ voice: {}, midi: {} }))
  }
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
    if (message) {
      const init = [STATUS_BYTES.sysex_start, ...MANUFACTURER_ID, 127, STATUS_BYTES.sysex_end];
      if (arraysEqual(init, Array.from(message.data))) { // If Live Remote Script sends Init SysEx handshake
        sessionStorage.setItem("config", JSON.stringify(emptyConfig))
        sysex([STATUS_BYTES.sysex_start, ...MANUFACTURER_ID, 1, STATUS_BYTES.sysex_end])
      }
      else {
        if (message.data[6] === 0) { // If config update
          let currentConfig = JSON.parse(sessionStorage.getItem("config"))
          let updatedConfig = MidiToJson(message.data, currentConfig)
          sessionStorage.setItem("config", JSON.stringify(updatedConfig))
        }
        else if (message.data[6] === 1 && message.data[message.data.length - 2]) { // If confirmation
          // Confirmation Logic goes here
        }
      }
    }

  }, [message])


  useEffect(() => {
    // Send Sysex Handshake
    if (sysex) {
      sysex([STATUS_BYTES.sysex_start, ...MANUFACTURER_ID, 1, STATUS_BYTES.sysex_end])
      sessionStorage.setItem("config", JSON.stringify(emptyConfig))
    }
  }, [sysex])



  useEffect(() => {
    if (alternatives.length !== 0) {
      const finalTranscript = transcriptParser.cleanupTranscript(alternatives);
      handleIntentDetection(finalTranscript)
      setTranscript(finalTranscript)
    }
  }, [alternatives])






  const startConnection = () => {
    peer = new Peer({ initiator: true, trickle: false, config: { iceServers: [] } })

    peer.on("connect", () => {
      setConnectionStatus("Connected")
      routerHistory.push('/voice-control');

    })
    peer.on("close", () => {
      setConnectionStatus("Disconnected")
    })

    peer.on("error", () => {
      setConnectionStatus("Disconnected")
    })
    peer.on("data", (data) => {
      const transcript = data.reduce((acc, cur) => acc + String.fromCharCode(cur), "")
      handleIntentDetection(transcript.toLowerCase())
    })
    peer.on('signal', data => {
      if (data.type === "offer") {
        data.sdp = spdCompact.compactSDP(data.sdp, { compress: true });
        const url = window.location.origin + window.location.pathname + '?' + btoa(JSON.stringify(data))
        setCode(url)

      }
    })
  }
  const handleQrResult = (data) => {
    if (data) {
      let answer = JSON.parse(atob(data.text))
      answer.sdp = spdCompact.decompactSDP(answer.sdp, false, { compress: true });
      peer?.signal(answer)
    }
  }

  const handleIntentDetection = (finalTranscript) => {
    if (JSON.parse(localStorage.getItem("preferences")).voice.wakeWord && finalTranscript.split(" ")[0] !== "TalkBack") {
      return
    }
    const macroActions = checkCommands(finalTranscript)
    if (macroActions) {
      setActions(macroActions)
    }
    else {
      const config = JSON.parse(sessionStorage.getItem("config"))
      const midiBytes = intentDetection.runDetection(String(finalTranscript), config)
      sysex(midiBytes)
    }
  }

  const checkCommands = (transcript) => {
    for (let i = 0; i < commands.length; i++) {
      if (commands[i].command === transcript) {
        return commands[i].actions;
      }
    }
    return false;
  }

  useEffect(() => {
    if (actions) {
      for (let action of actions) {
        const config = JSON.parse(sessionStorage.getItem("config"))
        const midiBytes = intentDetection.runDetection(String(action), config)
        sysex(midiBytes)
      }
    }
  }, [actions])



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
            path="/voice-control"
            render={(props) => <VoiceControl {...props} setAlternatives={setAlternatives} transcript={transcript} setTranscript={setTranscript} />}
          />
          <Route
            path="/preferences"
            render={(props) => <Preferences {...props} />}
          />
          <Route
            path="/commands"
            render={(props) => <CommandBuilder {...props} />}
          />
          <Route
            path="/help-and-support"
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
