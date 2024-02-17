
import React, { useRef, useContext } from "react";
import { ServicesContext } from "../contexts/ServicesContext";
import { IntentDetection } from "../intent_detection/IntentDetection";


const detector = new IntentDetection()
export default function CommandTesting() {
  
  const {config, sendMIDIMessage} = useContext(ServicesContext)
  const command = useRef("")
  const runTest = () => {
    const midiMessage = detector.runDetection(command.current, config)
    console.log(midiMessage)
    sendMIDIMessage(midiMessage)

  }

  return (
    <>
      <input onChange={(e) => { command.current = e.target.value }} />
      <button onClick={runTest}>Test
      </button>
    </>)
}
