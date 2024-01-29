import React, { useState } from "react";


export const MidiContext = React.createContext(null);

export default function CommandsProvider({ children, url }) {
  const [inputs, setInputs] = useState([])
  const [outputs, setOutputs] = useState([])
  const onMIDISuccess = (midiAccess) => {
    setInputs(Array.from(midiAccess.inputs.values()))
    setOutputs(Array.from(midiAccess.outputs.values()))
  }
  const onMIDIFailure = () => {
    console.log("MIDI Failed!");
  };
  navigator.requestMIDIAccess({ sysex: true }).then((onMIDISuccess), onMIDIFailure);
  return (
    <MidiContext.Provider value={{ inputs: inputs, outputs: outputs }}>
      {children}
    </MidiContext.Provider>
  );
}
