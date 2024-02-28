import React, { useState, useEffect, useContext } from 'react'
import { MidiContext } from '../../contexts/MidiContext'
import "../../styles/VoiceControl.css"

export default function OptionsPanel({ midiInputs }) {
  const prefs = JSON.parse(localStorage.getItem("preferences"))
  const [wakeWord, setWakeWord] = useState(prefs.voice.wakeWord)
  const [continuous, setContinous] = useState(prefs.voice.continuous)
  const { midi, dispatch } = useContext(MidiContext)
  const handleWakeWordPressed = () => {
    setWakeWord(!wakeWord)
    prefs.voice.wakeWord = !wakeWord
    localStorage.setItem("preferences", JSON.stringify(prefs))
  }
  const handleContinuousPressed = () => {
    setContinous(!continuous)
    prefs.voice.continuous = !continuous
    localStorage.setItem("preferences", JSON.stringify(prefs))
  }

  const handleMidiPortChanged = (event) => {
    dispatch({ type: "SAVE_MIC_INPUT", payload: event.target.value })
  }

  useEffect(() => {
    console.log(midi)

  }, [midi])


  return (
    <>
      <div className="options-panel d-flex flex-column">
        <div className="d-flex flex-direction-row" style={{ borderBottom: "0.2px solid grey" }}>
          <p className="h4 p-3" >
            Options
          </p>
        </div>


        <div className="d-flex p-3 flex-row align-items-center justify-content-between">
          <p className="p-3 text-secondary m-0">Wake word</p>
          <button onClick={handleWakeWordPressed} className={`btn ${wakeWord ? "btn-primary" : "btn-secondary"} m-0 w-25 text-center`}>   {wakeWord ? "On" : "Off"}</button>
        </div>


        <div className="d-flex p-3 flex-row align-items-center justify-content-between">
          <p className="p-3 text-secondary m-0">Continuous</p>
          <button onClick={handleContinuousPressed} className={`btn ${continuous ? "btn-primary" : "btn-secondary"} m-0 w-25 text-center`}>
            {continuous ? "On" : "Off"}</button>
        </div>

        <div className="d-flex p-3 flex-row align-items-center justify-content-between">
          <p className="p-3 text-secondary m-0">Language</p>
          <select className="form-select" aria-label="Select Language">
            <option>English (GB)</option>
            <option value="1">English (US)</option>
            <option value="2">English (DE)</option>
            <option value="3">English (In)</option>
          </select>

        </div>

        <div className="d-flex p-3 flex-row align-items-center justify-content-between">
          <p className="p-3 text-secondary m-0">MIDI Port</p>
          <select className="form-select" aria-label="wake word midi port" onChange={handleMidiPortChanged}>
            {midiInputs.map((input) => (
             
              <option value={input.id} key={input.id} selected={input.id === midi?.micInput}>{input.name}</option>
            ))}
          </select>

        </div>

        <div className="d-flex p-3 flex-row align-items-center justify-content-between">
          <p className="p-3 text-secondary m-0">MIDI Type</p>
          <select className="form-select" aria-label="Default select example">
            <option value="1">One</option>
            <option value="2">Two</option>
            <option value="3">Three</option>
          </select>

        </div>

        <div className="d-flex p-3 flex-row align-items-center justify-content-between">
          <p className="p-3 text-secondary m-0">MIDI CC/Note</p>
          <select className="form-select" aria-label="Default select example">
            <option value="1">One</option>
            <option value="2">Two</option>
            <option value="3">Three</option>
          </select>

        </div>
      </div>
    </>
  )
}
