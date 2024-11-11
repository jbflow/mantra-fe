import { useEffect, useState, useContext, useRef } from "react";
import SpeechDetector from "../SpeechDetector";
import React from 'react'
import OptionsPanel from "./OptionsPanel";
import { MidiContext } from "../../contexts/MidiContext";
import { arraysEqual } from "../../utils/utils";
import { midiDataToNames } from "../../utils/utils";
import { ConfirmationParser } from "../../intent_detection/ConfirmationParser";

const confirmationParser = new ConfirmationParser()



export default function VoiceControl({ transcript, setAlternatives, confirmation, setConfirmation, speak, speaking, actions, runningWorkflow }) {

  const [listening, setListening] = useState(false)
  const { dispatch, midiSettings, micInput, midiInputs } = useContext(MidiContext)
  const [mapping, setMapping] = useState(false) // button state



  const preferences = JSON.parse(localStorage.getItem("preferences"))
  const [voiceFeedback, setVoiceFeedback] = useState(preferences.voice.feedback)
  const [continuous, setContinuous] = useState(preferences.voice.continuous)
  const [language, setLanguage] = useState(preferences.voice.language)




  const handleVoiceFeedbackPressed = () => {
    setVoiceFeedback(!voiceFeedback)
    preferences.voice.feedback = !voiceFeedback
    localStorage.setItem("preferences", JSON.stringify(preferences))


  }
  const handleContinuousPressed = () => {
    setContinuous(!continuous)
    preferences.voice.continuous = !continuous
    localStorage.setItem("preferences", JSON.stringify(preferences))
  }

  const handleSelectWakeword = (ww) => {
    preferences.voice.wakeWord = ww
    localStorage.setItem("preferences", JSON.stringify(preferences))
  }

  const handleLanguageChange = (e) => {
    setLanguage(e.target.value)
    preferences.voice.language = e.target.value
    localStorage.setItem("preferences", JSON.stringify(preferences))
  }

  const handleMidiPortChanged = (event) => {
    dispatch({ type: "SAVE_MIC_INPUT", payload: event.target.value })
  }



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
    if (micInput) {
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
      const confirmationStr = confirmationParser.buildConfirmationStr(confirmation)
      speak({ text: confirmationStr })
      setConfirmation(false)
    }
  }, [confirmation])



  return <>
    <div className="voice-control-container">
      <div className="voice-btn-container">

        



        <div className="my-4">
          <SpeechDetector setAlternatives={setAlternatives} tlkbckSpeaking={speaking} listening={listening} handleSetListening={handleSetListening} runningWorkflow={runningWorkflow} />
        </div>

        <select className="form-select my-3" aria-label="select wake word" onChange={handleSelectWakeword} defaultvalue="computer">
          <option value="computer">Computer</option>
          <option value="jarvis">Jarvis</option>
        </select>

        
        <select className="form-select my-3" aria-label="wake word midi port" onChange={handleMidiPortChanged} value={midiSettings?.micInput}>
          {midiInputs?.map((input) => (
            <option value={input.id} key={input.id}>{input.name}</option>
          ))}
        </select>

        <div className="map-btn-container my-3">
          <button disabled={mapping} style={{ width: "7rem" }} className="midi-map-btn" onClick={handleMapMic}>{mapping ? "Mapping..." : "Map"}</button>
          <p className="text-white">{midiDataToNames(midiSettings.micMapping)}</p>
        </div>

        <select className="form-select my-3" aria-label="Select Language" onChange={handleLanguageChange} defaultValue={language}>
          <option value="en-GB">English (UK)</option>
          <option value="en-US">English (USA)</option>
          <option value="en-CA">English (CA)</option>
          <option value="en-NZ">English (NZ)</option>
          <option value="en-AU">English (AUS)</option>
          <option value="en-ZA">English (SA)</option>
          <option value="en-IN">English (India)</option>
        </select>

        

      </div>
    </div>
  </>
}
