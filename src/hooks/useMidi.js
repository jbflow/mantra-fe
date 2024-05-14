import { useState, useEffect, useRef } from "react";
import { arraysEqual, clearConfig } from "../utils/utils";
import { MidiToJson } from "../utils/MidiToJson";
import { emptyConfig } from "../utils/MidiConstants";

let midiInputs;
let midiOutputs;
let midiInput;
let midiOutput;

export default function useMidi() {
  const [midiInputOpen, setMidiInput] = useState(null);
  const [midiOutputOpen, setMidiOutput] = useState(null);
  const [dawLink, setDawLink] = useState(false);
  const [config, setConfig] = useState(emptyConfig);

  const sendMIDIMessage = (msg) => {
    if (msg) {
      midiOutput.send(msg);
    }
  };

  const getMIDIMessage = (msg) => {
    console.log("MSG", msg)
    const init = [240, 0, 0, 0, 0, 0, 127, 247];
    if (arraysEqual(init, Array.from(msg.data))) {
      // if message is init
      clearConfig(); // clear config
      setConfig(emptyConfig); // set it to empty
      sendMIDIMessage([240, 0, 0, 0, 0, 0, 1, 247]); // return msg to initialize
    } else if (!arraysEqual(Array.from(msg.data), init) && msg.data[6] === 0) {
      // if message is not init and is a config update
      let configStore = Object.assign({}, config); // make a copy of the config
      setConfig(MidiToJson(msg.data, configStore)); // and update it

     
      if (!dawLink) {
        setDawLink(true); // Turn on the DawLink light
      }
    } 
  };

  const onMIDISuccess = (midiAccess) => {
    midiInputs = Array.from(midiAccess.inputs.values());
    midiOutputs = Array.from(midiAccess.outputs.values());

    midiOutputs.forEach((output) => {
      if (output.name == "IAC Driver Bus 1") {
        output.open();
        midiOutput = output;
        setMidiOutput(true);
        sendMIDIMessage([240, 0, 0, 0, 0, 0, 1, 247]);
      }
    });
    midiInputs.forEach((input) => {
      if (input.name == "IAC Driver Bus 2") {
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

  return [
    midiInputOpen,
    midiOutputOpen,
    sendMIDIMessage,
    dawLink,
    config
  ];
}
