import React, { useEffect, useReducer, useState, useCallback } from "react";


export const MidiContext = React.createContext(null);

export default function MidiProvider({ children, url }) {
  const [midiAccess, setMidiAccess] = useState()
  const [midiInputs, setMidiInputs] = useState()
  const [midiOutputs, setMidiOutputs] = useState()
  const [mainInput, setMainInput] = useState()
  const [mainOutput, setMainOutput] = useState()
  const [micInput, setMicInput] = useState()







  const reducer = (state, action) => {
    switch (action.type) {
      case "SAVE_MAIN_INPUT":
        setMainInput(midiInputs.find(input => input.id === action.payload))
        return { ...state, mainInput: action.payload }
      case "SAVE_MAIN_OUTPUT":
        setMainOutput(midiOutputs.find(output => output.id === action.payload))
        return { ...state, mainOutput: action.payload }
      case "SAVE_MIC_INPUT":
        setMicInput(midiInputs.find(input => input.id === action.payload))
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
    requestMIDI()
  }, [])
  const requestMIDI = useCallback(async () => {
    const midiAccess = await navigator.requestMIDIAccess({ sysex: true })
    setMidiAccess(() => midiAccess)
    setMidiInputs(() => ([...midiAccess.inputs].map((input) => (input[1]))));
    setMidiOutputs(() => ([...midiAccess.outputs].map((output) => (output[1]))));
  }, [])

  useEffect(() => {
    midiInputs?.map((input) => {
      if (input.id === midiSettings.mainInput){
        input.open()
        setMainInput(input)
      }
      if (input.id === midiSettings.micInput) {
        input.open()
        setMicInput(input)
      }
    })
    midiOutputs?.map((output) => {
      if (output.id === midiSettings.mainOutput) {
        output.open()
        setMainOutput(output)
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
