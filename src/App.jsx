import React, { useState, useContext, useEffect, useRef } from "react";

import "./styles/App.css";
import "./styles/AppNext.css";
import "./styles/Transitions.css";


import CommandBuilder from "./components/CommandBuilder/CommandBuilder";
import NavBar from "./components/NavBar";
import TopBar from "./components/TopBar";
import StatusBar from "./components/StatusBar";


import { arraysEqual, getRandomResponse } from "./utils/utils";

import { IntentDetection } from "./intent_detection/IntentDetection";
import { TranscriptParser } from "./intent_detection/TranscriptParser";
import { CommandsContext } from "./contexts/CommandsContext";
import useTransferingConfig from "./hooks/useTransferingConfig";
import useSpeechSynthesis from "./hooks/useSpeechSynthesis";
import useWebSocket from "./hooks/useWebsocket";
import useWakeWord from "./hooks/useWakeWord";



import { confirmationPhrases } from "./utils/speechConstants";









const intentDetection = new IntentDetection()
const transcriptParser = new TranscriptParser()



function App({ signOut }) {

  // Create State
  const [alternatives, setAlternatives] = useState([])
  const [transcript, setTranscript] = useState("")
  const [dawLink, setDawLink] = useState(false)
  const [actions, setActions] = useState(false)
  const [confirmation, setConfirmation] = useState()
  const [awaitConfirmation, setAwaitConfirmation] = useState(false)
  
  const [runningWorkflow, setRunningWorkflow] = useState(false)

  const configRef = useRef()

  const { commands } = useContext(CommandsContext)




  const [configState, startTimer, setConfigTimer] = useTransferingConfig(configRef)
  const [bumblebee] = useWakeWord()
  const { speak, speaking } = useSpeechSynthesis()
  const { sendMessage, isConnected } = useWebSocket('ws://127.0.0.1', startTimer, setConfirmation, setConfigTimer,  configRef, dawLink, setDawLink);


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
          speak(getRandomResponse())
        }
      }
      catch (err) {
        console.log(err)
        speak("I'm sorry, an unexepected error has occured in the talk back system, please restart talk back and try again - it might also help to reload the MIDI Remote Script in Live.")
      }
    }
  }

  const checkCommands = (transcript) => {
    for (let i = 0; i < commands?.length; i++) {
      if (commands[i].command === transcript) {
        speak(`running workflow: ${commands[i].command}`)
        setRunningWorkflow(true)

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
      setRunningWorkflow(false);
      const timer = setTimeout(() => {
        speak("workflow finished");

        setActions(false);
      }, 1000); // 1000ms delay
    }
  }, [actions])



  useEffect(() => {
    if (awaitConfirmation && confirmation && actions && !configState) {
      // Create shallow copies of the arrays
      const confirmationCopy = Array.from(confirmation);
      const awaitConfirmationCopy = Array.from(awaitConfirmation);

      // Remove second-to-last item from both arrays (if arrays have at least 2 elements)
      if (confirmationCopy.length >= 2) confirmationCopy.splice(-2, 1);
      if (awaitConfirmationCopy.length >= 2) awaitConfirmationCopy.splice(-2, 1);

      // Compare the arrays and update the state accordingly
      if (arraysEqual(confirmationCopy, awaitConfirmationCopy) && actions.length !== 0) {
        setActions(actions.slice(1));
      }
    }
  }, [configState, awaitConfirmation, confirmation, actions]);









 


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
        <NavBar setAlternatives={setAlternatives} transcript={transcript} confirmation={confirmation} setConfirmation={setConfirmation} speak={speak} speaking={speaking} actions={actions} runningWorkflow={runningWorkflow} />
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
