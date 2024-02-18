import { useState } from "react";
import SpeechDetector from "./SpeechDetector";
import React from 'react'

export default function VoiceControl() {
  const [transcript, setTranscript] = useState("")
  const [alternatives, setAlternatives] = useState([])
  const [listening, setListening] = useState(false)

  const backgroundColor = listening ? "#1477fc" : "#7A7E83"
  return <>
    <div>
      <SpeechDetector setTranscript={setTranscript} setAlternatives={setAlternatives} setListening={setListening} backgroundColor={backgroundColor} />
    </div>
  </>

}
