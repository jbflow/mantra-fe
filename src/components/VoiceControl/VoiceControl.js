import { useEffect, useState, useContext, useRef } from "react";
import SpeechDetector from "../SpeechDetector";
import React from 'react'
import OptionsPanel from "./OptionsPanel";
import useMIDIMessage from "../../hooks/useMIDIMessage";
import { MidiContext } from "../../contexts/MidiContext";


export default function VoiceControl({ finalTranscript, transcript, setTranscript, setAlternatives, listening, setListening }) {
  useEffect(() => {
    setTranscript(finalTranscript)
  }, [finalTranscript])
  const { midiSettings, midiInputs, dispatch, micInput } = useContext(MidiContext)
  const [mapping, setMapping] = useState(false) // button state
  const message = useMIDIMessage(micInput) // listen for midi message
  const speechRef = useRef()


  useEffect(() => {
    if (mapping && message) {
      setMapping(false)
      dispatch({ type: "SAVE_MIC_MAPPING", payload: message.data[1] })
    }
    else if(!mapping && message && message.data[1] === midiSettings.micMapping){
      console.log("HELLO")
      speechRef.current.startListening()
     
    }
  }, [mapping, message])

  const handleMapMic = () => {
    setMapping(true)
  }



  return <>
    <div className="voice-control-container">
      <div>
        <OptionsPanel mapping={mapping} handleMapMic={handleMapMic} />
      </div>
      <div className="voice-btn-container">
        <p className="h1">{listening ? "tlkbck is listening!" : "Press to speak"}</p>
        <SpeechDetector setTranscript={setTranscript} setAlternatives={setAlternatives} setListening={setListening} ref={speechRef} />
        <p className="pt-5 px-3 mt-5 h3 font-italic">{transcript ? `"${transcript}"` : "..."}</p>
      </div>
    </div>
  </>

}
