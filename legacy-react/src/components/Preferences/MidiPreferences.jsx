import React, { useContext, useState, useEffect } from "react";
import { IoMdCopy } from "react-icons/io";
import { Button, Row, Col } from 'react-bootstrap'
import { MidiContext } from "../../contexts/MidiContext";

export default function MidiPreferences() {
  const { dispatch, midiSettings, midiInputs, midiOutputs } = useContext(MidiContext)
  const [selectedCommandPorts, setSelectedCommandPorts] = useState([])
  const [availableCommandPorts, setAvailableCommandPorts] = useState([])

  useEffect(() => {

    function getMidiPorts() {
      setAvailableCommandPorts(midiOutputs?.map(i => i.id))
    }
    getMidiPorts()
  }, [midiInputs, midiOutputs])


  const getMidiName = (id) => (midiOutputs?.find(i => i.id === id)?.name)




  const handleMainInputChanged = (event) => {
    console.log("CHANGE")
    dispatch({type: "SAVE_MAIN_INPUT", payload: event.target.value})

  }

  const handleMainOutputChanged = (event) => {
    dispatch({type: "SAVE_MAIN_OUTPUT", payload: event.target.value})
  }

  const handleCommandPortsChanged = (ports) => {
    setSelectedCommandPorts(ports)
    dispatch({type: "SAVE_CMD_PORTS", payload: ports})

  }

  return (
    <>
      
        <div className="d-flex p-3 flex-row align-items-center justify-content-between">

          
          <p className="p-3 text-secondary m-0">In Port</p>
          <select className="form-select" aria-label="Default select example" onChange={handleMainInputChanged} value={midiSettings?.mainInput}>
            {midiInputs?.map((i) => {
              return (
                <option key={i.id} value={i.id}>{i.name}</option>
              )
            })}
          </select>
        </div>

        <div className="d-flex p-3 flex-row align-items-center justify-content-between">
          <p className="p-3 text-secondary m-0">Out Port</p>
          <select className="form-select" aria-label="Default select example" onChange={handleMainOutputChanged} value={midiSettings?.mainOutput}>
            {midiOutputs?.map((i) => {
              return (
                <option key={i.id} value={i.id}>{i.name}</option>
              )
            })}
          </select>

        </div>


        {/* COMBO PICKLIST FOR COMMAND MIDI PORTS */}
        {/* <div className="d-flex p-3 flex-row align-items-center justify-content-between">
          <p className="p-3 text-secondary m-0">Command MIDI Ports</p>
          <div className="flex-col">
            <p>Available</p>
            <select multiple={true} className="form-select" aria-label="Default select example" onChange={e => {
              const options = [...e.target.selectedOptions]
              const values = options.map(i => i.value) // .map(option => ({id: option.value, name: option.name}))
              console.log({ values })
              handleCommandPortsChanged([...selectedCommandPorts, ...values])
              setAvailableCommandPorts(availableCommandPorts.filter(i => i !== values[0]))
            }}>
              {availableCommandPorts?.map((i) => {
                return (
                  <option key={i} value={i}>{getMidiName(i)}</option>
                )
              })}
            </select>
          </div>
          <div className="flex-col">
            <p>Open for Commands</p>
            <select multiple={true} className="form-select" aria-label="Default select example" onChange={e => {
              const options = [...e.target.selectedOptions]
              const values = options.map(option => option.value)
              setAvailableCommandPorts([...availableCommandPorts, ...values])
              handleCommandPortsChanged(selectedCommandPorts.filter(i => i !== values[0]))
            }}>
              {selectedCommandPorts.map((i) => {
                return (
                  <option key={i} value={i}>{getMidiName(i)}</option>
                )
              })}
            </select>
          </div>
        </div> */}
 
    </>
  );
}
