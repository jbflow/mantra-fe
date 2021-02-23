import { MidiToJson } from "../utils/MidiToJson";
import { updateMidiInputs, updateMidiOutputs } from "../components/Preferences";

let config;

let midiInputs = [];
let midiOutputs = [];
let midiInput;
let midiOutput;

var setConfigOnSpeech;

const setConfig = (midi) => {
  config = MidiToJson(midi, config);
  // console.log('config: ', config);
  setConfigOnSpeech(config);
};

export const getMIDIMessage = (msg) => {
  // Setting the new Config when MIDI message received
  if (msg.data !== [240, 0, 0, 0, 0, 0, 127, 247]) {
    setConfig(msg.data);
  }
};

export const sendMIDIMessage = (msg) => {
  if (msg) {
    console.log("sendMIDIMessage: ", msg);
    midiOutput.send(msg);
  }
};

export const setInPort = (portName) => {
  midiInputs.forEach((input) => {
    if (input.name == portName && input.name !== "Choose...") {
      midiInput = input;
    } else if (input.connection == "open") {
      input.close();
    }
  });
  midiInput.onmidimessage = getMIDIMessage;
};
export const setOutPort = (portName) => {
  midiOutputs.forEach((output) => {
    if (output.name == portName && output.name !== "Choose...") {
      midiOutput = output;
    } else if (output.connection == "open") {
      output.close();
    }
  });
  midiOutput.send([240, 0, 0, 0, 0, 0, 127, 247]);
};

const onMIDISuccess = (midiAccess) => {
  midiInputs = Array.from(midiAccess.inputs.values());
  midiOutputs = Array.from(midiAccess.outputs.values());
  if (updateMidiInputs) updateMidiInputs(midiInputs);
  if (updateMidiOutputs) updateMidiOutputs(midiOutputs);
};

const onMIDIFailure = () => {
  console.log("MIDI Failed!");
};
const requestMIDI = () => {
  navigator
    .requestMIDIAccess({ sysex: true })
    .then(onMIDISuccess, onMIDIFailure);
};

export const startMidi = (setConfig) => {
  setConfigOnSpeech = setConfig;
  requestMIDI();
};
