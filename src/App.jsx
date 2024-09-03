import React, { useState, useContext, useEffect, useRef } from "react";

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
import { STATUS_BYTES } from "./utils/MidiConstants";
import { MANUFACTURER_ID } from "./intent_detection/constants";
import { emptyConfig } from "./utils/MidiConstants";
import { arraysEqual } from "./utils/utils";
import { MidiToJson } from "./utils/MidiToJson";
import VoiceControl from "./components/VoiceControl/VoiceControl";
import { IntentDetection } from "./intent_detection/IntentDetection";
import { TranscriptParser } from "./intent_detection/TranscriptParser";
import { CommandsContext } from "./contexts/CommandsContext";
import useTransferingConfig from "./hooks/useTransferingConfig";
import { detectWakeWord } from "./intent_detection/WakeWord";
import Preferences from "./components/Preferences/PreferencesPage";
import useSpeechSynthesis from "./hooks/useSpeechSynthesis";
import useWebSocket from "./hooks/useWebsocket";

import BumbleBee from "bumblebee-hotword"

const bumblebee = new BumbleBee();

bumblebee.setSensitivity(0.5);

bumblebee.setWorkersPath('bumblebee-workers');

bumblebee.addHotword('jarvis');

bumblebee.setHotword('jarvis');







const intentDetection = new IntentDetection()
const transcriptParser = new TranscriptParser()



function App({ signOut }) {
  const [alternatives, setAlternatives] = useState([])
  const [transcript, setTranscript] = useState("")
  const [dawLink, setDawLink] = useState(false)
  const [actions, setActions] = useState(false)
  const [awaitConfirmation, setAwaitConfirmation] = useState(false)
  const [confirmation, setConfirmation] = useState()
  const configRef = useRef()
  const [configState, startTimer, setConfigTimer] = useTransferingConfig(configRef)
  const { commands } = useContext(CommandsContext)
  const { speak, speaking } = useSpeechSynthesis()
  const { messages, sendMessage, isConnected, manualConnect } = useWebSocket('ws://127.0.0.1');



  const handleIntentDetection = (finalTranscript) => {
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
          sendMessage(intentDetectionResult)
        } else {
          speak({ text: "Sorry, I didn't detect a valid command" })
        }
      }
      catch (err) {
        console.log(err)
        speak({ text: "I'm sorry, somethings gone wrong. Please try again" })

      }
    }
  }

  const checkCommands = (transcript) => {
    for (let i = 0; i < commands?.length; i++) {
      if (commands[i].command === transcript) {
        return commands[i].actions;
      }
    }
    return false;
  }



  useEffect(() => {
    if (actions && actions.length !== 0 && actions[0].type === "voice") {
      const config = JSON.parse(sessionStorage.getItem("config"))
      const midiBytes = intentDetection.runDetection(String(actions[0].data), config)
      if (midiBytes) {
        let confirmationMsg = Array.from(midiBytes)
        confirmationMsg.splice(confirmationMsg.length - 2, 1)
        confirmationMsg[6] = 96
        setAwaitConfirmation(confirmationMsg)
        sendMessage(midiBytes)
      }
      else {
        setActions(actions.slice(1))

      }
    }
    else if (actions.length === 0) {
      speak({ text: "Executed Macro" })
      setActions(false)
    }
  }, [actions])

  useEffect(() => {
    if (awaitConfirmation && confirmation && actions && !configState) {
      if (arraysEqual(Array.from(confirmation), awaitConfirmation) && actions.length !== 0) {
        setActions(actions.slice(1))
      }
    }
  }, [configState])






  const handleSocketMessage = (message) => {
    /*/
    MIDI Entry Point
   /*/

    if (message) {

      const init = [STATUS_BYTES.sysex_start, ...MANUFACTURER_ID, 127, STATUS_BYTES.sysex_end];
      if (arraysEqual(init, Array.from(message))) { // If Live Remote Script sends Init SysEx handshake
        configRef.current = { ...emptyConfig }
        startTimer()

      }
      else {
        if (message[6] === 0) { // If config update
          setConfigTimer(0)
          let updatedConfig = MidiToJson(message, configRef.current)
          configRef.current = updatedConfig
          if (!dawLink) {
            setDawLink(true)
          }
        }
        else if (message[6] === 96) { // If confirmation
          console.log("Confirmation message received")
          let data = Array.from(message)
          data.splice(message.length - 2, 1)
          setConfirmation(data)
          startTimer()
        }
      }
    }
  }

  const initConfig = () => {
    sendMessage([STATUS_BYTES.sysex_start, ...MANUFACTURER_ID, 1, STATUS_BYTES.sysex_end])
    sessionStorage.setItem("config", JSON.stringify(emptyConfig))
  }

  useEffect(() => {
    if (Array.isArray(messages) && messages.length > 0) {
      for (let msg of messages) {
        handleSocketMessage(msg)
      }
    }
  }, [messages]);




  useEffect(() => {
    // When the web socket connects, init the config transfer by sending sysex handshake
    if (isConnected) {
      initConfig()
    }
  }, [isConnected])



  useEffect(() => {
    if (alternatives.length !== 0) {
      const macroCommands = commands?.map(cmd => cmd.command)
      const finalTranscript = transcriptParser.cleanupTranscript(alternatives, macroCommands);
      handleIntentDetection(finalTranscript)
      console.log("FINAL ", finalTranscript)
      setTranscript(finalTranscript)
    }
  }, [alternatives])


  useEffect(() => {

    bumblebee.start()
    bumblebee.on("hotword", () => {
      document.getElementById("tlkbck-btn").click()
    })
  }, [])









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
              element={<VoiceControl setAlternatives={setAlternatives} transcript={transcript} confirmation={confirmation} setConfirmation={setConfirmation} speak={speak} speaking={speaking} actions={actions} />}
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

        <StatusBar dawLink={dawLink} isConnected={isConnected} />
      </div >

    </>
  );
}

export default App
