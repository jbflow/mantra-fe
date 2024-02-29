import { useEffect, useState, useContext, useRef } from "react";
import SpeechDetector from "../SpeechDetector";
import React from 'react'
import OptionsPanel from "./OptionsPanel";
import useMIDIMessage from "../../hooks/useMIDIMessage";
import { MidiContext } from "../../contexts/MidiContext";


export default function VoiceControl({ finalTranscript, transcript, setTranscript, setAlternatives, listening, setListening, midiInputs }) {
  useEffect(() => {
    setTranscript(finalTranscript)
  }, [finalTranscript])
  const { midi, dispatch } = useContext(MidiContext)
  const [mapping, setMapping] = useState(false) // button state
  const [mappingPort, setMappingPort] = useState(midiInputs.map(input => input.id === midi.micInput))
  const message = useMIDIMessage(mappingPort) // listen for midi message
  const [mappedMessage, setMappedMessage] = useState([]) // mapped message
  const speechRef = useRef()


  useEffect(() => {
    if (mapping && message) {
      setMappedMessage(message.data)
      setMapping(false)
      dispatch({ type: "SAVE_MIC_MAPPING", payload: message.data[1] })
    }
    else if(!mapping && message && message.data[1] === midi.micMapping){
      console.log("HELLO")
      speechRef.current.startListening()
     
    }
  }, [mapping, message])

  useEffect(()=> {
    midiInputs.map((input) => {
      if (input.id === midi.micInput) {
        input.open()
        setMappingPort(input)
      }
      else {
        // Handle Logic for closing unused ports
      }
    })
  }, [midiInputs])



  return <>
    <div className="voice-control-container">
      <div>
        <OptionsPanel midiInputs={midiInputs} setMappingPort={setMappingPort} mapping={mapping} setMapping={setMapping} mappedMessage={mappedMessage} />
      </div>
      <div className="voice-btn-container">
        <p className="h1">{listening ? "tlkbck is listening!" : "Press to speak"}</p>
        <SpeechDetector setTranscript={setTranscript} setAlternatives={setAlternatives} setListening={setListening} ref={speechRef} />
        <p className="pt-5 px-3 mt-5 h3 font-italic">{transcript ? `"${transcript}"` : "..."}</p>
      </div>
    </div>
  </>

}
