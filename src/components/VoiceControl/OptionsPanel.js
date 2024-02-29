import React, { useState, useEffect, useContext } from 'react'
import { MidiContext } from '../../contexts/MidiContext'
import "../../styles/VoiceControl.css"
import useMIDIMessage from '../../hooks/useMIDIMessage'

export default function OptionsPanel({ midiInputs }) {
  const prefs = JSON.parse(localStorage.getItem("preferences"))
  const [wakeWord, setWakeWord] = useState(prefs.voice.wakeWord)
  const [continuous, setContinous] = useState(prefs.voice.continuous)
  const { midi, dispatch } = useContext(MidiContext)
  
  const [mapping, setMapping] = useState(false) // button state
  const [mappingPort, setMappingPort] = useState(midiInputs.map(input => input.id === midi.micInput)) // port to accept mappings
  const message = useMIDIMessage(mappingPort) // listen for midi message
  const [mappingMessage, setMappingMessage] = useState([]) // mapped message
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

  useEffect(() => {
    console.log(mappingMessage)

  }, [mappingMessage])

  const handleMidiPortChanged = (event) => {
    midiInputs.map((input) => {
      if (input.id === event.target.value) {
        input.open()
        setMappingPort(input)
      }
      else {
        // Handle Logic for closing unused ports
      }
    })
    dispatch({ type: "SAVE_MIC_INPUT", payload: event.target.value })
  }

  const handleMapMic = () => {
    setMapping(true)
  }

  useEffect(() => {
    if (mapping && message) {
      setMappingMessage(message.data)
      setMapping(false)
      dispatch({ type: "SAVE_MIC_MAPPING", payload: message.data[1] })
    }
  }, [mapping, message])

  useEffect(()=> {
    midiInputs.map((input) => {
      if (input.id === midi.micInput) {
        input.open()
        setMappingPort(input)
      }
      else {
        // Handle Logic for closing unused ports
      }
    })
  }, [midiInputs])




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
          <select className="form-select" aria-label="wake word midi port" onChange={handleMidiPortChanged} value={midi?.micInput}>
            {midiInputs.map((input) => (
              <option value={input.id} key={input.id}>{input.name}</option>
            ))}
          </select>
        </div>

        <div className="d-flex p-3 flex-row align-items-center justify-content-between">
          <p className="p-3">
            <button disabled={mapping} style={{ width: "7rem" }} className="btn btn-primary text-center" onClick={handleMapMic}>{mapping ? "Mapping..." : "Map"}</button>
          </p>
          <p>{JSON.stringify(mappingMessage)}</p>

        </div>
      </div>
    </>
  )
}
