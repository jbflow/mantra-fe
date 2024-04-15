import { useEffect, useState, useContext, useRef } from "react";
import SpeechDetector from "../SpeechDetector";
import React from 'react'
import OptionsPanel from "./OptionsPanel";
import useMIDIMessage from "../../hooks/useMIDIMessage";
import { MidiContext } from "../../contexts/MidiContext";
import { arraysEqual } from "../../utils/utils";
import PhoneConnect from "../PhoneConnect";


export default function VoiceControl({ transcript, setAlternatives, connectionStatus, confirmation, speak, speaking }) {
  const [listening, setListening] = useState(false)
  const { dispatch, midiSettings, micInput } = useContext(MidiContext)
  const [mapping, setMapping] = useState(false) // button state


  const handleMidiMessage = (message) => {
    console.log(message)
    console.log("hi", mapping)
    if (mapping && message && isMappable(message.data[0])) {
      dispatch({ type: "SAVE_MIC_MAPPING", payload: Array.from(message.data.slice(0, 2)) })
      setMapping(false)
    }
    else if (!mapping && message && arraysEqual(Array.from(message.data.slice(0, 2)), midiSettings.micMapping)) {
      document.getElementById('tlkbck-btn').click()
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
    console.log(confirmation)
    if (confirmation) {
      speak({ text: "Command confirmed" })
    }
  }, [confirmation])

  useEffect(() => {


  }, [speaking])

  return <>
    <div className="voice-control-container">
      <div>
        <OptionsPanel />
      </div>
      <div className="voice-btn-container">
        <p className="h1">{connectionStatus === "Disconnected" ? listening ? "tlkbck is listening!" : "Press to speak" : "Tethered"}</p>
        <SpeechDetector setAlternatives={setAlternatives} tlkbckSpeaking={speaking} listening={listening} handleSetListening={handleSetListening} />

        <div className="d-flex p-3 flex-row align-items-center justify-content-between">
          <p className="p-3">
            <button disabled={mapping} style={{ width: "7rem" }} className="midi-map-btn" onClick={handleMapMic}>{mapping ? "Mapping..." : "Map"}</button>
          </p>
        </div>
        <p className="pt-5 px-3 mt-5 h3 font-italic">{transcript ? `"${transcript}"` : "..."}</p>
        <PhoneConnect connectionStatus={connectionStatus} />
      </div>

    </div>
  </>

}
