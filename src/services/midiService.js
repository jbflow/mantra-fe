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
  console.log("getMIDIMessage: ", msg.data);
  // Setting the new Config when MIDI message received
  if (msg.data != [240, 0, 0, 0, 0, 0, 127, 247]) {
    setConfig(msg.data);
  }
};

export const sendMIDIMessage = (msg) => {
  if (msg) {
    console.log("sendMIDIMessage: ", msg);
    midiOutput.send(msg);
  }
};

export const setInPort = (input) => {
  inPortName = input;
  console.log(input);
};
export const setOutPort = (output) => {
  outPortName = output;
  console.log(output);
};

const onMIDISuccess = (midiAccess) => {
  midiInputs = Array.from(midiAccess.inputs.values());
  midiOutputs = Array.from(midiAccess.outputs.values());
  console.log(midiInputs, midiOutputs);
  midiOutput = midiOutputs[0];
  midiInput = midiInputs[1];
  midiOutput.send([240, 0, 0, 0, 0, 0, 127, 247]);
  midiInput.onmidimessage = getMIDIMessage;
  // window.Preferences.setMidiPorts(midiInputs, midiOutputs); // set the ports in the prefs componenet to render them in drop downs
};

const onMIDIFailure = () => {
  console.log("MIDI Failed!");
};
const requestMIDI = () => {
  navigator
    .requestMIDIAccess({ sysex: true })
    .then(onMIDISuccess, onMIDIFailure);
};

// const openOutPort = () => {
//   midiOutputs.forEach((outPort) => {
//     if (outPort.name == outPortName) {
//       midiOutput = outPort;
//       midiOutput.send([240, 0, 0, 0, 0, 0, 127, 247]);
//     }
//   });
// };
// const openInPort = () => {
//   midiInputs.forEach((inPort) => {
//     if (inPort.name == inPortName) {
//       console.log("open in Port:", inPort.name);

//       midiInput = inPort;
//       midiInput.onmidimessage = getMIDIMessage;
//     }
//   });
// };

export const startMidi = (setConfig) => {
  setConfigOnSpeech = setConfig;
  requestMIDI();
};
