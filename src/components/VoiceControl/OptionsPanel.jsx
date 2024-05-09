import React, { useState, useContext, useEffect } from 'react'
import { MidiContext } from '../../contexts/MidiContext'
import "../../styles/VoiceControl.css"
import MidiPreferences from '../Preferences/MidiPreferences'
import PhoneConnect from '../PhoneConnect'


export default function OptionsPanel() {
  const preferences = JSON.parse(localStorage.getItem("preferences"))
  const [wakeWord, setWakeWord] = useState(preferences.voice.wakeWord)
  const [voiceFeedback, setVoiceFeedback] = useState(preferences.voice.feedback)
  const [continuous, setContinuous] = useState(preferences.voice.continuous)
  const [language, setLanguage] = useState(preferences.voice.language)
  const { midiSettings, midiInputs, dispatch } = useContext(MidiContext)

  const handleWakeWordPressed = () => {
    setWakeWord(!wakeWord)
    preferences.voice.wakeWord = !wakeWord
    localStorage.setItem("preferences", JSON.stringify(preferences))
  }

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

  const handleLanguageChange = (e) => {
    setLanguage(e.target.value)
    preferences.voice.language = e.target.value
    localStorage.setItem("preferences", JSON.stringify(preferences))
  }

  const handleMidiPortChanged = (event) => {
    dispatch({ type: "SAVE_MIC_INPUT", payload: event.target.value })
  }


  return (
    <>
      <div className="options-panel d-flex flex-column">
        <div className="options-box">
          <p className="h5 px-4 pt-2">Voice Settings</p>
          <div className="d-flex p-3 flex-row align-items-center justify-content-between">
            <p className="p-3 text-secondary m-0">Voice feedback</p>
            <button onClick={handleVoiceFeedbackPressed} className={`btn ${voiceFeedback ? "btn-primary" : "btn-secondary"} m-0 w-25 text-center`}>   {voiceFeedback ? "On" : "Off"}</button>
          </div>
          <div className="d-flex p-3 flex-row align-items-center justify-content-between">
            <p className="p-3 text-secondary m-0">Continuous</p>
            <button onClick={handleContinuousPressed} className={`btn ${continuous ? "btn-primary" : "btn-secondary"} m-0 w-25 text-center`}>
              {continuous ? "On" : "Off"}</button>
          </div>
          <div className="d-flex p-3 flex-row align-items-center justify-content-between">
            <p className="p-3 text-secondary m-0">Language</p>
            <select className="form-select" aria-label="Select Language" onChange={handleLanguageChange} defaultValue={language}>
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

        <div className='options-box'>
          <p className="h5 px-4 pt-2">MIDI Settings</p>

          <div className="d-flex p-3 flex-row align-items-center justify-content-between">
            <p className="p-3 text-secondary m-0">Mic Port</p>
            <select className="form-select" aria-label="wake word midi port" onChange={handleMidiPortChanged} value={midiSettings?.micInput}>
              {midiInputs?.map((input) => (
                <option value={input.id} key={input.id}>{input.name}</option>
              ))}
            </select>
          </div>

          <MidiPreferences />


        </div>
        
      </div>

    </>
  )
}
