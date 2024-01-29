
import React, { useRef } from "react";
import { IntentDetection } from "../intent_detection/IntentDetection";


const detector = new IntentDetection()
export default function CommandTesting() {
  
  
  const command = useRef("")
  const runTest = () => {
    const midiMessage = detector.runDetection(command.current)
    console.log(midiMessage)
    // sendMIDIMessage(midiMessage)

  }

  return (
    <>
      <input onChange={(e) => { command.current = e.target.value }} />
      <button onClick={runTest}>Test
      </button>
    </>)
}
