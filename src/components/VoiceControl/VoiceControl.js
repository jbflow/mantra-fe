import { useEffect, useState } from "react";
import SpeechDetector from "../SpeechDetector";
import React from 'react'
import OptionsPanel from "./OptionsPanel";

export default function VoiceControl({ finalTranscript, transcript, setTranscript, setAlternatives, listening, setListening, midiInputs }) {
  useEffect(() => {
    setTranscript(finalTranscript)
  }, [finalTranscript])

  return <>
    <div className="voice-control-container">
      <div>
        <OptionsPanel midiInputs={midiInputs} />
      </div>
      <div className="voice-btn-container">
        <p className="h1">{listening ? "tlkbck is listening!" : "Press to speak"}</p>
        <SpeechDetector setTranscript={setTranscript} setAlternatives={setAlternatives} setListening={setListening} />
        <p className="pt-5 px-3 mt-5 h3 font-italic">{transcript ? `"${transcript}"` : "..."}</p>
      </div>
    </div>
  </>

}
