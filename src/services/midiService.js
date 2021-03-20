import { MidiToJson } from "../utils/MidiToJson";
// import { updateMidiInputs, updateMidiOutputs } from "../App";
// import { updateConfig } from "../components/Dashboard/Dashboard";

import { updateMidiIn, updateMidiOut } from "../App";
import { updateScriptConnected } from "../components/StatusBar";

let config;

let midiInputs = [];
let midiOutputs = [];
let midiInput;
let midiOutput;

var setConfigOnSpeech;

const setConfig = (midi) => {
  config = MidiToJson(midi, config);
  // console.log('config: ', config);
  updateScriptConnected(true);
  setConfigOnSpeech(config);
  // updateConfig(config);
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

// export const openInPort = (portName) => {
//   midiInputs.forEach((input) => {
//     if (input.name === portName && input.name !== "Choose...") {
//       midiInput = input;
//     } else if (input.connection === "open") {
//       input.close();
//     }
//   });

//   if (midiInput) midiInput.onmidimessage = getMIDIMessage;
// };

// export const openOutPort = (portName) => {
//   console.log('openOutPort: ', openOutPort);
//   midiOutputs.forEach((output) => {
//     if (output.name === portName && output.name !== "Choose...") {
//       midiOutput = output;
//     } else if (output.connection === "open") {
//       output.close();
//     }
//   });
//   if (midiOutput && midiInput && midiOutput.name === midiInput.name) {
//     alert("MIDI In and Out cannot be the same port!");
//   } else {
//     sendInit();
//   }
// };

const onMIDISuccess = (midiAccess) => {
  midiInputs = Array.from(midiAccess.inputs.values());
  midiOutputs = Array.from(midiAccess.outputs.values());
  midiInputs.forEach((input) => {
    if (input.name === "Bridge") {
      midiInput = input;
      console.log(midiInput);
      if (midiInput) midiInput.onmidimessage = getMIDIMessage;
    }
  });
  midiOutputs.forEach((output) => {
    if (output.name === "Bridge") {
      midiOutput = output;
      console.log(midiOutput);
    }
  });

  if (updateMidiIn) updateMidiIn(midiInput.name);
  if (updateMidiOut) updateMidiOut(midiOutput.name);
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
