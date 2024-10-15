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
import { IntentDetection } from "./intent_detection/IntentDetection";
import { TranscriptParser } from "./intent_detection/TranscriptParser";
import { CommandsContext } from "./contexts/CommandsContext";
import useTransferingConfig from "./hooks/useTransferingConfig";

import Preferences from "./components/Preferences/PreferencesPage";
import useSpeechSynthesis from "./hooks/useSpeechSynthesis";
import useWebSocket from "./hooks/useWebsocket";

import BumbleBee from "bumblebee-hotword"

import { confirmationPhrases } from "./utils/speechConstants";









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

  const bumblebee = new BumbleBee();

  bumblebee.setSensitivity(0.5);

  bumblebee.setWorkersPath('bumblebee-workers');

  bumblebee.addHotword('jarvis');
  bumblebee.addHotword('computer');

  bumblebee.setHotword('jarvis');

  const getRandomResponse = () => {
    const randomIndex = Math.floor(Math.random() * confirmationPhrases.length);
    return confirmationPhrases[randomIndex];
  }

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
          speak({ text: getRandomResponse() })
        }
      }
      catch (err) {
        console.log(err)
        speak({ text: "I'm sorry, an unexepected error has occured in the talk back system, please restart talk back and try again - it might also help to reload the MIDI Remote Script in Live." })
      }
    }
  }

  const checkCommands = (transcript) => {
    for (let i = 0; i < commands?.length; i++) {
      if (commands[i].command === transcript) {
        speak({ text: `running workflow: ${commands[i].command}` })

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
      speak({ text: "workflow finished" })
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


    console.log("I AM MESSAGE:", message)

    if (message) {
      if (Array.isArray(message)) {
        const init = [STATUS_BYTES.sysex_start, ...MANUFACTURER_ID, 127, STATUS_BYTES.sysex_end];
        if (arraysEqual(init, Array.from(message))) { // If Live Remote Script sends Init SysEx handshake
          configRef.current = { ...emptyConfig }
          startTimer()

        }

        else if (message[6] === 96) { // If confirmation
          console.log("Confirmation message received")
          let data = Array.from(message)
          data.splice(message.length - 2, 1)
          setConfirmation(data)
          startTimer()
        }


      }
      else {
        setConfigTimer(0)
        let existingConfig = JSON.parse(sessionStorage.getItem("config"))
        let updatedConfig = {
          ...existingConfig,
          ...message
        }
        configRef.current = updatedConfig
        sessionStorage.setItem("config", JSON.stringify(updatedConfig))
        if (!dawLink) {
          setDawLink(true)
        }
      }

    }
  }


  const initConfig = () => {
    
    sendMessage([STATUS_BYTES.sysex_start, ...MANUFACTURER_ID, 1, STATUS_BYTES.sysex_end])
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
      if (finalTranscript.includes("stop listening")) {
        document.getElementById("tlkbck-btn").click()
      }
      else {
        handleIntentDetection(finalTranscript)
        console.log("FINAL ", finalTranscript)

        setTranscript(finalTranscript)
      }
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
        <NavBar setAlternatives={setAlternatives} transcript={transcript} confirmation={confirmation} setConfirmation={setConfirmation} speak={speak} speaking={speaking} actions={actions} />
        <div
          style={{
            paddingTop: 54,
            paddingLeft: 210,
          }}
        >
          <CommandBuilder />


        </div>

        <StatusBar dawLink={dawLink} isConnected={isConnected} />
      </div >

    </>
  );
}

export default App
