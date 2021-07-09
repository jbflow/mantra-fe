import { useState, useEffect } from "react";
import { arraysEqual } from "../../utils/utils";
import { MidiToJson } from "../../utils/MidiToJson";

let midiInputs;
let midiOutputs;
let midiInput;
let midiOutput;

export default function useMidi(config, setConfig) {
  const [midiInputOpen, setMidiInput] = useState(null);
  const [midiOutputOpen, setMidiOutput] = useState(null);
  const [dawLink, setDawLink] = useState(false);

  const sendMIDIMessage = (msg) => {
    if (msg) {
      midiOutput.send(msg);
    }
  };

  const getMIDIMessage = (msg) => {
    const init = [240, 0, 0, 0, 0, 0, 127, 247];
    if (!arraysEqual(Array.from(msg.data), init) && msg.data[6] === 0) {
      setConfig(MidiToJson(msg.data, config));
      if (!dawLink) {
        setDawLink(true);
      }
    } else if (arraysEqual(init, Array.from(msg.data))) {
      sendMIDIMessage([240, 0, 0, 0, 0, 0, 1, 247]);
    }
  };

  const onMIDISuccess = (midiAccess) => {
    midiInputs = Array.from(midiAccess.inputs.values());
    midiOutputs = Array.from(midiAccess.outputs.values());

    midiOutputs.forEach((output) => {
      if (output.name == "tlkbck") {
        output.open();
        midiOutput = output;
        setMidiOutput(true);
      }
    });
    midiInputs.forEach((input) => {
      if (input.name == "tlkbck") {
        midiInput = input;
        input.onmidimessage = getMIDIMessage;
        setMidiInput(true);
      }
    });
  };

  const onMIDIFailure = () => {
    console.log("MIDI Failed!");
  };

  useEffect(() => {
    navigator
      .requestMIDIAccess({ sysex: true })
      .then(onMIDISuccess, onMIDIFailure);
  }, []);

  return [midiInputOpen, midiOutputOpen, sendMIDIMessage, dawLink];
}
