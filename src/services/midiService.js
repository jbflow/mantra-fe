import { MidiToJson } from "../utils/MidiToJson";

let config;

let midiOutputs;
let midiInputs;

let inPortName;
let outPortName;

let midiOutput;
let midiInput;
var setConfigOnSpeech;

const setConfig = (midi) => {
  config = MidiToJson(midi, config);
  // console.log('config: ', config);
  setConfigOnSpeech(config);
};

export const getMIDIMessage = (msg) => {
  // console.log('getMIDIMessage: ', msg.data);
  // Setting the new Config when MIDI message received
  setConfig(msg.data);
};

export const sendMIDIMessage = (msg) => {
  if (msg) {
    console.log("sendMIDIMessage: ", msg);
    midiOutput.send(msg);
  }
};

export const setportNames = (input, output) => {
  console.log(output);
  inPortName = input;
  outPortName = output;
};

const onMIDISuccess = (midiAccess) => {
  midiInputs = Array.from(midiAccess.inputs.values());
  midiInput = midiInputs[1];
  if (!midiInput) {
    alert("No MIDI ports connected! Start LoopMIDI");
    return;
  }
  midiOutputs = Array.from(midiAccess.outputs.values());
  midiOutput = midiOutputs[0];
  midiOutput.send([240, 0, 0, 0, 0, 0, 127, 247]);
  midiInput.onmidimessage = getMIDIMessage;

  window.Preferences.setMidiPorts(midiInputs, midiOutputs); // set the ports in the prefs componenet to render them in drop downs
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
