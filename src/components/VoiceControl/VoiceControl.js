import { useEffect, useState } from "react";
import SpeechDetector from "../SpeechDetector";
import React from 'react'
import OptionsPanel from "./OptionsPanel";

export default function VoiceControl({ finalTranscript, transcript, setTranscript, setAlternatives, listening, setListening, connectionStatus }) {
  useEffect(() => {
    setTranscript(finalTranscript)
  }, [finalTranscript])
  console.log(connectionStatus)
  return <>
    <div className="voice-control-container">
      <div>
        <OptionsPanel />
      </div>
      <div className="voice-btn-container">
        <p className="h1">{connectionStatus === "Disconnected" ? listening ? "tlkbck is listening!" : "Press to speak" : "Tethered"}</p>
        <SpeechDetector setTranscript={setTranscript} setAlternatives={setAlternatives} setListening={setListening} />
        <p className="pt-5 px-3 mt-5 h3 font-italic">{transcript ? `"${transcript}"` : "..."}</p>
      </div>
    </div>
  </>

}
