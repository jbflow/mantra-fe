import React, { useEffect, useReducer } from "react";


export const MidiContext = React.createContext(null);

export default function MidiProvider({ children, url }) {

  const reducer = (state, action) => {
    switch (action.type) {
      case "INIT":
        return action.payload
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



  const [midi, dispatch] = useReducer(reducer, null)

  useEffect(() => {
    dispatch({
      type: "INIT", payload: {
        mainInput: "1176834884",
        mainOutput: "-317426978",
        micInput: "",
        micMapping: "",
        cmdOutput: ""
      }
    })
  }, [])

  return (
    <MidiContext.Provider value={{ midi, dispatch }}>
      {children}
    </MidiContext.Provider>
  );
}
