import React, { useEffect, useReducer, useState, useCallback } from "react";


export const MidiContext = React.createContext(null);

export default function MidiProvider({ children, url }) {
  const [midiAccess, setMidiAccess] = useState()
  const [midiInputs, setMidiInputs] = useState()
  const [midiOutputs, setMidiOutputs] = useState()
  const [mainInput, setMainInput] = useState()
  const [mainOutput, setMainOutput] = useState()
  const [micInput, setMicInput] = useState()


  useEffect(() => {
    requestMIDI()
  }, [])
  const requestMIDI = useCallback(async () => {
    const midiAccess = await navigator.requestMIDIAccess({ sysex: true })
    setMidiAccess(() => midiAccess)
    setMidiInputs(() => ([...midiAccess.inputs].map((input) => (input[1]))));
    setMidiOutputs(() => ([...midiAccess.outputs].map((output) => (output[1]))));
  }, [])




  const reducer = (state, action) => {
    switch (action.type) {
      case "SAVE_MAIN_INPUT":
        setMainInput(midiInputs.map(input => input.id === action.payload))
        return { ...state, mainInput: action.payload }
      case "SAVE_MAIN_OUTPUT":
        setMainOutput(midiOutputs.map(output => output.id === action.payload))
        return { ...state, mainOutput: action.payload }
      case "SAVE_MIC_INPUT":
        console.log("PAYLOAD", action.payload)
        setMicInput(midiInputs.map(input => input.id === action.payload))
        state.micInput = action.payload
        return { ...state, micInput: action.payload }
      case "SAVE_MIC_MAPPING":
        return { ...state, micMapping: action.payload }
      case "SAVE_CMD_OUTPUT":
        return { ...state, cmdOutput: action.payload }
      default:
        return
    }
  }

  const [midiSettings, dispatch] = useReducer(reducer, localStorage.hasOwnProperty("midiSettings") ? JSON.parse(localStorage.getItem("midiSettings"))
    : {
      mainInput: "1176834884",
      mainOutput: "-317426978",
      micInput: "",
      micMapping: "",
      cmdOutput: ""
    })

  useEffect(() => {
    console.log("MIDI SETTINGS", midiSettings)
    midiInputs?.map((input) => {
      if (input.id === midiSettings.mainInput || input.id === midiSettings.micInput) {
        input.open()
      }
      else {
        input.close()
      }
    })
    midiOutputs?.map((output) => {
      if (output.id === midiSettings.mainOutput) {
        output.open()
      }
    })
    localStorage.setItem("midiSettings", JSON.stringify(midiSettings))
  }, [midiSettings, midiInputs, midiOutputs])


  return (
    <MidiContext.Provider value={{ dispatch, midiSettings, midiAccess, midiInputs, midiOutputs, mainOutput, mainInput, micInput }}>
      {children}
    </MidiContext.Provider>
  );
}
