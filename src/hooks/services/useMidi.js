import { useState, useEffect } from "react";
import { arraysEqual, clearConfig } from "../../utils/utils";
import { MidiToJson } from "../../utils/MidiToJson";
import { emptyConfig } from "../../utils/MidiConstants";

let midiInputs;
let midiOutputs;
let midiInput;
let midiOutput;

export default function useMidi() {
  const [midiInputOpen, setMidiInput] = useState(null);
  const [midiOutputOpen, setMidiOutput] = useState(null);
  const [dawLink, setDawLink] = useState(false);
  const [config, setConfig] = useState(emptyConfig);

  useEffect(() => {
    console.log(config.sel_track);
  }, [config]);

  const sendMIDIMessage = (msg) => {
    if (msg) {
      midiOutput.send(msg);
    }
  };

  const getMIDIMessage = (msg) => {
    console.log("getmidi:", msg);
    const init = [240, 0, 0, 0, 0, 0, 127, 247];
    if (arraysEqual(init, Array.from(msg.data))) {
      clearConfig();
      setConfig(emptyConfig);
      sendMIDIMessage([240, 0, 0, 0, 0, 0, 1, 247]);
    }
    if (!arraysEqual(Array.from(msg.data), init) && msg.data[6] === 0) {
      let configStore = Object.assign({}, config);
      setConfig(MidiToJson(msg.data, configStore));
      if (!dawLink) {
        setDawLink(true);
      }
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
        sendMIDIMessage([240, 0, 0, 0, 0, 0, 1, 247]);
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

  return [midiInputOpen, midiOutputOpen, sendMIDIMessage, dawLink, config];
}
