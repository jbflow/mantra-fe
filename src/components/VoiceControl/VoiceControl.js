import { useEffect, useState, useContext, useRef } from "react";
import SpeechDetector from "../SpeechDetector";
import React from 'react'
import OptionsPanel from "./OptionsPanel";
import useMIDIMessage from "../../hooks/useMIDIMessage";
import { MidiContext } from "../../contexts/MidiContext";
import { arraysEqual } from "../../utils/utils";
import PhoneConnect from "../PhoneConnect";
import useSpeechSynthesis from "../../hooks/useSpeechSynthesis";


export default function VoiceControl({ finalTranscript, transcript, setTranscript, setAlternatives, listening, setListening, connectionStatus, confirmation, speak, speaking }) {
  useEffect(() => {
    setTranscript(finalTranscript)
  }, [finalTranscript])
  const { dispatch, midiSettings, micInput } = useContext(MidiContext)
  const [mapping, setMapping] = useState(false) // button state
  const [message, clearMessage] = useMIDIMessage(micInput) // listen for midi message
  const speechRef = useRef()


  const convertToNoteOff = (noteArray) => {
    let newNoteArray = Array.from(noteArray)
    newNoteArray[0] -= 16
    return newNoteArray
  }

  const isMappable = (statusByte) => {
    return (statusByte >= 128 && statusByte <= 143) || // Note Off (128-143)
      (statusByte >= 144 && statusByte <= 159) || // Note On (144-159)
      (statusByte >= 176 && statusByte <= 191);   // Control Change (176-191)
  }


  useEffect(() => {
    if (mapping && message && isMappable(message.data[0])) {
      clearMessage()
      dispatch({ type: "SAVE_MIC_MAPPING", payload: Array.from(message.data.slice(0, 2)) })
    }
    else if (!mapping && message && arraysEqual(Array.from(message.data.slice(0, 2)), midiSettings.micMapping)) {
      speechRef.current.startListening()
    }
    else if (!mapping && message && arraysEqual(Array.from(message.data.slice(0, 2)), convertToNoteOff(midiSettings.micMapping))) {
      speechRef.current.stopListening()
    }

  }, [mapping, message])

  const handleMapMic = () => {
    dispatch({ type: "SAVE_MIC_MAPPING", payload: null })
    setMapping(true)
  }

  useEffect(() => {
    if (midiSettings.micMapping) {
      setMapping(false)
    }

  }, [midiSettings])

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
        <SpeechDetector setTranscript={setTranscript} setAlternatives={setAlternatives} setListening={setListening} tlkbckSpeaking={speaking}/>

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
