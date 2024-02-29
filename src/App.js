import React, { useState, useContext, useEffect, useRef } from "react";
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
import PreferencesPage from "./components/Preferences/PreferencesPage";
import VoiceControl from "./components/VoiceControl/VoiceControl";
import { IntentDetection } from "./intent_detection/IntentDetection";
import { TranscriptParser } from "./utils/TranscriptParser";
import * as spdCompact from "sdp-compact";
import { CommandsContext } from "./contexts/CommandsContext";
import useTransferingConfig from "./hooks/useTransferingConfig";

const options = { compress: true };
const intentDetection = new IntentDetection()
const transcriptParser = new TranscriptParser()


function App({ signOut }) {
  const [alternatives, setAlternatives] = useState([])
  const [transcript, setTranscript] = useState("")
  const [listening, setListening] = useState(false)
  const [dawLink, setDawLink] = useState(false)
  const [midiIn, setMidiIn] = useState(false)
  const [midiOut, setMidiOut] = useState(false)
  const [actions, setActions] = useState(false)
  const [awaitConfirmation, setAwaitConfirmation] = useState(false)
  const [confirmation, setConfirmation] = useState()
  const [configState, startTimer, setConfigTimer] = useTransferingConfig()
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
    if (mainInput) {
      mainInput.onstatechange = (event) => {
        if (event.currentTarget.connection === "open") {
          setMidiIn(true)
        }

      }
    }
    if (mainOutput) {
      mainOutput.onstatechange = (event) => {
        if (event.currentTarget.connection === "open") {
          setMidiOut(true)
        }

      }
    }

  }, [mainInput, mainOutput])

  useEffect(() => {
    if (actions) {
      const config = JSON.parse(sessionStorage.getItem("config"))
      const midiBytes = intentDetection.runDetection(String(actions[0]), config)
      let confirmationMsg = Array.from(midiBytes)
      confirmationMsg.splice(confirmationMsg.length - 2, 1)
      confirmationMsg[6] = 96
      setAwaitConfirmation(confirmationMsg)
      // console.log(midiBytes)
      sysex(midiBytes)
    }

  }, [actions])

  useEffect(() => {
    // console.log(configState)
    if (awaitConfirmation && confirmation && actions && !configState) {
      if (arraysEqual(Array.from(confirmation), awaitConfirmation) && actions.length !== 0) {
        setActions(actions.slice(1))
      }
      else if (actions.length === 0) {
        // console.log("FINISHED EXECUTING MACRO")
        setActions(false)
      }
    }
  }, [configState])


  useEffect(() => {
    if (midi)
      navigator.requestMIDIAccess({ sysex: true }).then(onMIDISuccess, onMIDIFailure);
  }, [midi])


  useEffect(() => {
    /*/
    MIDI Entry Point
   /*/
    if (message) {
      const init = [STATUS_BYTES.sysex_start, ...MANUFACTURER_ID, 127, STATUS_BYTES.sysex_end];
      if (arraysEqual(init, Array.from(message.data))) { // If Live Remote Script sends Init SysEx handshake
        sessionStorage.setItem("config", JSON.stringify(emptyConfig))
        sysex([STATUS_BYTES.sysex_start, ...MANUFACTURER_ID, 1, STATUS_BYTES.sysex_end])
      }
      else {
        if (message.data[6] === 0) { // If config update
          setConfigTimer(0)
          let currentConfig = JSON.parse(sessionStorage.getItem("config"))
          let updatedConfig = MidiToJson(message.data, currentConfig)
          sessionStorage.setItem("config", JSON.stringify(updatedConfig))
          if (!dawLink) {
            setDawLink(true)
          }
        }
        else if (message.data[6] === 96) { // If confirmation
          let data = Array.from(message.data)
          data.splice(message.data.length - 2, 1)
          setConfirmation(data)
          startTimer()

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
      const macroCommands = commands.map(cmd => cmd.command)
      const finalTranscript = transcriptParser.cleanupTranscript(alternatives, macroCommands);
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
            render={(props) => <VoiceControl {...props} setAlternatives={setAlternatives} transcript={transcript} setTranscript={setTranscript} listening={listening} setListening={setListening} />}
          />
          {/* <Route
            path="/preferences"
            render={(props) => <Preferences {...props} />}
          /> */}
          <Route
          path="/account"
            render={(props) => <PreferencesPage {...props} />}
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

        <StatusBar connectionStatus={connectionStatus} midiIn={midiIn} midiOut={midiOut} dawLink={dawLink} transcript={transcript} listening={listening} />
      </div>
    </>
  );
}

export default App;
