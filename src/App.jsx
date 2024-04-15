import React, { useState, useContext, useEffect } from "react";

import "./styles/App.css";
import "./styles/AppNext.css";
import "./styles/Transitions.css";
import { Route, Routes } from "react-router-dom";
// import Peer from "simple-peer"
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
import VoiceControl from "./components/VoiceControl/VoiceControl";
import { IntentDetection } from "./intent_detection/IntentDetection";
import { TranscriptParser } from "./intent_detection/TranscriptParser";
import * as spdCompact from "sdp-compact";
import { CommandsContext } from "./contexts/CommandsContext";
import useTransferingConfig from "./hooks/useTransferingConfig";
import { detectWakeWord } from "./intent_detection/WakeWord";
import Preferences from "./components/Preferences/PreferencesPage";
import useSpeechSynthesis from "./hooks/useSpeechSynthesis";



const options = { compress: true };
const intentDetection = new IntentDetection()
const transcriptParser = new TranscriptParser()


function App({ signOut }) {

  const [alternatives, setAlternatives] = useState([])
  const [transcript, setTranscript] = useState("")

  const [dawLink, setDawLink] = useState(false)
  const [midiIn, setMidiIn] = useState(false)
  const [midiOut, setMidiOut] = useState(false)
  const [actions, setActions] = useState(false)
  const [awaitConfirmation, setAwaitConfirmation] = useState(false)
  const [confirmation, setConfirmation] = useState()
  const [configState, startTimer, setConfigTimer] = useTransferingConfig()
  const { commands } = useContext(CommandsContext)
  const { mainOutput, mainInput } = useContext(MidiContext)
  const { speak, speaking } = useSpeechSynthesis()

  const { sysex } = useMIDIOutput(mainOutput)
  const [connectionStatus, setConnectionStatus] = useState("Disconnected")


  if (!localStorage.getItem("preferences")) {
    localStorage.setItem("preferences", JSON.stringify({ voice: { wakeWord: false, continuous: false, language: "en-UK" } }))
  }

  const handleIntentDetection = (finalTranscript) => {

    if (JSON.parse(localStorage.getItem("preferences")).voice.wakeWord && !detectWakeWord(finalTranscript) || finalTranscript === "") {
      return
    }
    const macroActions = checkCommands(finalTranscript)
    if (macroActions) {
      setActions(macroActions)
    }
    else {
      try {
        const config = JSON.parse(sessionStorage.getItem("config"))
        const intentDetectionResult = intentDetection.runDetection(String(finalTranscript), config)
        console.log("INTENT DETECTION RESULT: ", intentDetectionResult)
        if (intentDetectionResult) {
          sysex(intentDetectionResult)
        } else {
          speak({ text: "Sorry, I didn't detect a valid command" })
        }
      }
      catch (err) {
        speak({ text: "Sorry, I don't think I can do that" })

      }
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
      if (mainInput.connection === "open") { setMidiIn(true) }
      mainInput.onstatechange = (event) => {
        if (event.currentTarget.connection === "open") {
          setMidiIn(true)
        }

      }
    }
    if (mainOutput) {
      if (mainOutput.connection === "open") { setMidiOut(true) }
      mainOutput.onstatechange = (event) => {
        if (event.currentTarget.connection === "open") {
          setMidiOut(true)
        }
      }
    }

  }, [mainInput, mainOutput])

  useEffect(() => {
    if (actions && actions.length !== 0 && actions[0].type === "voice") {
      const config = JSON.parse(sessionStorage.getItem("config"))
      const midiBytes = intentDetection.runDetection(String(actions[0].data), config)
      let confirmationMsg = Array.from(midiBytes)
      confirmationMsg.splice(confirmationMsg.length - 2, 1)
      confirmationMsg[6] = 96
      setAwaitConfirmation(confirmationMsg)
      sysex(midiBytes)
    }
    else if (actions.length === 0) {
      speak({ text: "Executed Macro" })
      setActions(false)
    }
  }, [actions])

  useEffect(() => {
    // console.log(configState)
    if (awaitConfirmation && confirmation && actions && !configState) {
      if (arraysEqual(Array.from(confirmation), awaitConfirmation) && actions.length !== 0) {
        setActions(actions.slice(1))
      }
    }
  }, [configState])






  const handleMidiMessage = (message) => {
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
  }

  useMIDIMessage(mainInput, handleMidiMessage)




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
      console.log("FINAL ", finalTranscript)
      setTranscript(finalTranscript)
    }
  }, [alternatives])








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

          <Routes>
            <Route
              path="/voice-control"
              element={<VoiceControl setAlternatives={setAlternatives} transcript={transcript} connectionStatus={connectionStatus} confirmation={confirmation} speak={speak} speaking={speaking} actions={actions} />}
            />
            <Route
              path="/preferences"
              element={<Preferences />}
            />

            <Route
              path="/commands"
              element={<CommandBuilder />}
            />
            <Route
              path="/help-and-support"
              element={<CommandTesting />}
            />
          </Routes>



        </div>

        <StatusBar connectionStatus={connectionStatus} midiIn={midiIn} midiOut={midiOut} dawLink={dawLink} transcript={transcript} />
      </div >

    </>
  );
}

export default App
