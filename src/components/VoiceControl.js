import { useEffect, useState } from "react";
import SpeechDetector from "./SpeechDetector";
import React from 'react'

export default function VoiceControl({ finalTranscript, transcript, setTranscript, setAlternatives }) {
  

  useEffect(() => {
    setTranscript(finalTranscript)
  }, [finalTranscript])

  return <>
    <div className="mb-5">
      <SpeechDetector setTranscript={setTranscript} setAlternatives={setAlternatives}/>
    </div>

    <div style={{ display: "flex", flexDirection: "column", alignItems: "center" }}>
      <p className="pt-5 px-3 mt-5 h3 font-italic">{transcript ? `"${transcript}"` : "..."}</p>
    </div>
  </>

}
