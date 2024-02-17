import React, { useEffect, useState } from "react";


export const MidiContext = React.createContext(null);

export default function MidiProvider({ children, url }) {
  const [inputs, setInputs] = useState([])
  const [outputs, setOutputs] = useState([])
  const onMIDISuccess = (midiAccess) => {
    setInputs(Array.from(midiAccess.inputs.values()))
    setOutputs(Array.from(midiAccess.outputs.values()))
  }
  const onMIDIFailure = () => {
    console.log("error")
  }


  const reducer = (state, action) => {
    switch(action.type){
      case "INIT":
        navigator.requestMIDIAccess({ sysex: true }).then((onMIDISuccess), onMIDIFailure);
      case "OPEN_MAIN_INPUT":
        state.mainInput = action.payload
      case "OPEN_MAIN_OUTPUT":
        state.mainOutput = action.payload
      case "OPEN_MIC_INPUT":
        state.micInput = action.payload
      case "MAP_MIC":
        state.micMsg = action.payload
      case "OPEN_CMD_OUT":
        state.cmdOutput = action.payload
      default:
        return state
    }
    return state
  }
  return (
    <MidiContext.Provider value={{ inputs: inputs, outputs: outputs }}>
      {children}
    </MidiContext.Provider>
  );
}
