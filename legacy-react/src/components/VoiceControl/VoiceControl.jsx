import { useEffect, useState, useContext, useRef } from "react";
import SpeechDetector from "../SpeechDetector";
import React from 'react'
import OptionsPanel from "./OptionsPanel";
import { MidiContext } from "../../contexts/MidiContext";
import { arraysEqual } from "../../utils/utils";
import { midiDataToNames } from "../../utils/utils";
import { ConfirmationParser } from "../../intent_detection/ConfirmationParser";

const confirmationParser = new ConfirmationParser()



export default function VoiceControl({ transcript, setAlternatives, confirmation, setConfirmation, speak, speaking, actions }) {
  
  const [listening, setListening] = useState(false)
  const { dispatch, midiSettings, micInput } = useContext(MidiContext)
  const [mapping, setMapping] = useState(false) // button state



  const handleMidiMessage = (message) => {
    if (mapping && message && isMappable(message.data[0]) && message.data[2] === 0) {
      dispatch({ type: "SAVE_MIC_MAPPING", payload: Array.from(message.data.slice(0, 2)) })
      setMapping(false)
    }
    else if (!mapping && message && arraysEqual(Array.from(message.data.slice(0, 2)), midiSettings.micMapping)) {
      document.getElementById("tlkbck-btn").click()
    }
  }


  useEffect(() => {
    if(micInput){
      micInput.onmidimessage = handleMidiMessage
    }
  }, [micInput, mapping])
  


  const isMappable = (statusByte) => {
    return (statusByte >= 128 && statusByte <= 143) || // Note Off (128-143)
      (statusByte >= 144 && statusByte <= 159) || // Note On (144-159)
      (statusByte >= 176 && statusByte <= 191);   // Control Change (176-191)
  }




  const handleMapMic = () => {
    setMapping(true)
  }

  const handleSetListening = (value) => {
    setListening(value)
  }


  useEffect(() => {
    
    if (confirmation && !actions) {
      console.log("CONFIRMATION: ", confirmation)
      const confirmationStr = confirmationParser.buildConfirmationStr(confirmation)
      console.log(confirmationStr)
      speak({ text: confirmationStr })
      setConfirmation(false)
    }
  }, [confirmation])



  return <>
    <div className="voice-control-container">
      <div>
        <OptionsPanel />
      </div>
      <div className="voice-btn-container">
        <p className="h1">{listening ? "tlkbck is listening!" : "Press to speak"}</p>
        <SpeechDetector setAlternatives={setAlternatives} tlkbckSpeaking={speaking} listening={listening} handleSetListening={handleSetListening} />
        <div className="map-btn-container">
            <button disabled={mapping} style={{ width: "7rem" }} className="midi-map-btn" onClick={handleMapMic}>{mapping ? "Mapping..." : "Map"}</button>
            <p>{midiDataToNames(midiSettings.micMapping)}</p>
        </div>
        <p className="pt-5 px-3 mt-5 h3 font-italic">{transcript ? `"${transcript}"` : "..."}</p> 
      </div>
    </div>
  </>

}
