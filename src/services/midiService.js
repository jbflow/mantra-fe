import { MidiToJson } from "../utils/MidiToJson";

let config;
let midiOutput
let midiInput;
var setConfigOnSpeech;

const setConfig = (midi) => {
	config = MidiToJson(midi, config);
	// console.log('config: ', config);
	setConfigOnSpeech(config);
}

export const getMIDIMessage = (msg) => {
	// console.log('getMIDIMessage: ', msg.data);
	// Setting the new Config when MIDI message received
	setConfig(msg.data)
};

export const sendMIDIMessage = (msg) => {
	console.log('sendMIDIMessage: ', msg);
	// console.log(msg)
	try {
		midiOutput.send(msg);
	} catch (error) {
		console.log('error sending midi: ', error);

	}
};

const onMIDISuccess = (midiAccess) => {
	midiInput = Array.from(midiAccess.inputs.values())[1];
	if (!midiInput) {
		alert("No MIDI ports connected! Start LoopMIDI")
		return;
	}
	midiOutput = Array.from(midiAccess.outputs.values())[0];
	midiOutput.send([240, 0, 0, 0, 0, 0, 127, 247]);
	midiInput.onmidimessage = getMIDIMessage;
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
}