import React, {useContext, useState, useEffect} from "react";
import { IoMdCopy } from "react-icons/io";
import { Button, Row, Col } from 'react-bootstrap'
import { MidiContext } from "../../contexts/MidiContext";

export default function MidiPreferences() {
  const midiType = {
   cc: "CC",
   note: "NOTE"
  }
  const { midi, dispatch } = useContext(MidiContext)
  const [inputPort, setInputPort] = useState(midi?.mainInput);
  const [outputPort, setOutputPort] = useState(midi?.mainOutput);
  const [availableInputs, setAvailableInputs] = useState([])
  const [availableOutputs, setAvailableOutputs] = useState([])
  const [wakeWordType, setWakeWordType] = useState(midiType.cc)
  const [wakeWordCC, setWakeWordCC] = useState(0);
  const [selectedCommandPorts, setSelectedCommandPorts] = useState([])
  const [availableCommandPorts, setAvailableCommandPorts] = useState([])

  useEffect(() => {
    console.log(JSON.stringify({
    inputPort,
    outputPort,
    wakeWordCC,
    wakeWordType,
    midi
  }, null, 2))


  async function getMidiInputs() {
    const MIDI = await navigator.requestMIDIAccess()
    setAvailableOutputs(Array.from(MIDI.outputs.values()).map((i) => ({id: i.id, name: i.name})))
    setAvailableInputs(Array.from(MIDI.inputs.values()).map((i) => ({id: i.id, name: i.name})))
    setAvailableCommandPorts(availableOutputs.map(i => i.id))
}
  getMidiInputs()
}, [inputPort, outputPort, wakeWordCC, wakeWordType])

  const midiPorts = [...Array(16).keys()]
  const getMidiName = (id) => (availableOutputs.find(i => i.id === id)?.name)
  
  const allAvailableMidiCC = [...Array(128).keys()]

  const saveMidiPorts = () => {
    // Dispatch update to midi storage
    dispatch({type:"SAVE_MAIN_INPUT", payload: inputPort})
    dispatch({type:"SAVE_MAIN_OUTPUT", payload: outputPort})
    dispatch({type:"SAVE_CMD_OUTPUT", payload: selectedCommandPorts})
    dispatch({type:"SAVE_WWORD_TYPE", payload: wakeWordType})
    dispatch({type:"SAVE_WWORD_CC", payload: wakeWordCC})

  }

  const updateCommandPort = () => {

  }
  
  return (
    <>  
      <div className="voice-btn-container">
        <p className="h1">MIDI Preferences</p>
        <div className="d-flex p-3 flex-row align-items-center justify-content-between">
          <p className="p-3 text-secondary m-0">Tlkbck MIDI Port In</p>
          <select className="form-select" aria-label="Default select example" onChange={(e) => setInputPort(Number(e.target.value))}>
            {availableInputs.map((i) => {
                return ( 
                    <option value={i.id}>{i.name}</option>
                )
            })}
          </select>
        </div>

        <div className="d-flex p-3 flex-row align-items-center justify-content-between">
          <p className="p-3 text-secondary m-0">Tlkbck MIDI Port Out</p>
          <select className="form-select" aria-label="Default select example" onChange={(e) => setOutputPort(Number(e.target.value))}>
            {availableOutputs.map((i) => {
                return (
                    <option value={i.id}>{i.name}</option>
                )
            })}
          </select>

        </div>

        <div className="d-flex p-3 flex-row align-items-center justify-content-between">
          <p className="p-3 text-secondary m-0">Wake Word MIDI Type</p>
          <select className="form-select" aria-label="Default select example" onChange={(e) => setWakeWordType(e.target.value)}>
            <option value={midiType.cc}>CC</option>
            <option value={midiType.note}>Note</option>
          </select>
        </div>

        <div className="d-flex p-3 flex-row align-items-center justify-content-between">
          <p className="p-3 text-secondary m-0">Wake Word MIDI CC/Note</p>
          <select className="form-select" aria-label="Default select example" onChange={(e) => setWakeWordCC(Number(e.target.value))}>
            {allAvailableMidiCC.map((i) => {
                return (
                    <option value={i}>{i}</option>
                )
            })}
          </select>

        </div>

        {/* COMBO PICKLIST FOR COMMAND MIDI PORTS */}
        <div className="d-flex p-3 flex-row align-items-center justify-content-between">
          <p className="p-3 text-secondary m-0">Command MIDI Ports</p>
          <div className="flex-col">
          <p>Available</p>
          <select multiple={true} className="form-select" aria-label="Default select example" onChange={e => {
            const options = [...e.target.selectedOptions]
            const values = options.map(i => i.value) // .map(option => ({id: option.value, name: option.name}))
            console.log({values})
            setSelectedCommandPorts([...selectedCommandPorts, ...values])
            setAvailableCommandPorts(availableCommandPorts.filter(i => i !== values[0]))
          }}>
            {availableCommandPorts.map((i) => {
                console.log(getMidiName(i))
                return (
                  <option value={i}>{getMidiName(i)}</option>
                )
            })}
          </select>
          </div>
          <div className="flex-col">
          <p>Selected</p>
          <select multiple={true} className="form-select" aria-label="Default select example" onChange={e => {
            const options = [...e.target.selectedOptions]
            const values = options.map(option => option.value)
            setAvailableCommandPorts([...availableCommandPorts, ...values])
            setSelectedCommandPorts(selectedCommandPorts.filter(i => i !== values[0]))
          }}>
            {selectedCommandPorts.map((i) => {
                return (
                  <option value={i}>{getMidiName(i)}</option>
                )
            })}
          </select>
         </div>
      </div>
      <Button onClick={saveMidiPorts}>Save</Button>
      </div>
    </>
  );
}
