import React, { useEffect, useReducer, useState } from "react";


export const MidiContext = React.createContext(null);

export default function MidiProvider({ children, url }) {

  const onMIDISuccess = (midiAccess, state) => {
    state.midiInputs = Array.from(midiAccess.inputs.values())
    state.midiOutputs = Array.from(midiAccess.outputs.values())
  }
  const onMIDIFailure = (e) => {
    console.error(e)
  }
  const reducer = (state, action) => {
    switch (action.type) {
      case "INIT":
        navigator.requestMIDIAccess({ sysex: true }).then(((midiAccess) => { onMIDISuccess(midiAccess, state) }), onMIDIFailure);
        return state
      case "OPEN_MAIN_INPUT":
        state.mainInput = action.payload
        return state
      case "OPEN_MAIN_OUTPUT":
        state.mainOutput = action.payload
        return state
      case "OPEN_MIC_INPUT":
        state.micInput = action.payload
        return state
      case "MAP_MIC":
        state.micMsg = action.payload
        return state
      case "OPEN_CMD_OUT":
        state.cmdOutput = action.payload
        return state
      default:
        return
    }

  }

  const [midi, dispatch] = useReducer(reducer, null)
  return (
    <MidiContext.Provider value={{ midi, dispatch }}>
      {children}
    </MidiContext.Provider>
  );
}
