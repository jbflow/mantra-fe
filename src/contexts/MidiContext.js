import React, { useEffect, useReducer } from "react";


export const MidiContext = React.createContext(null);

export default function MidiProvider({ children, url }) {


  const reducer = (state, action) => {
    switch (action.type) {
      case "SAVE_MAIN_INPUT":
        return { ...state, mainInput: action.payload }
      case "SAVE_MAIN_OUTPUT":
        return { ...state, mainOutput: action.payload }
      case "SAVE_MIC_INPUT":
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

  const [midi, dispatch] = useReducer(reducer, localStorage.hasOwnProperty("midiSettings") ? JSON.parse(localStorage.getItem("midiSettings"))
    : {
      mainInput: "-317426978",
      mainOutput: "1176834884",
      micInput: "",
      micMapping: "",
      cmdOutput: ""
    })

  useEffect(() => {
    localStorage.setItem("midiSettings", JSON.stringify(midi))
  }, [midi])


  return (
    <MidiContext.Provider value={{ midi, dispatch }}>
      {children}
    </MidiContext.Provider>
  );
}
