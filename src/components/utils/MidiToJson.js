// Set up a bunch of consts for mapping the nouns
const NOUN_MAP = {
	3: 'tracks',
	5: 'scenes',
	10: 'devices',
	11: 'clips',
	22: 'parameters',
	39: 'instruments',
	40: 'audio_devices',
	41: 'midi_devices'
}

const SEL_MAP = {
	3: 'sel_track',
	10: 'sel_device'
}

export const VERBS = {
	'rename': 1,
	'load': 2,
	'create': 2,
	'make': 2,
	'add': 2,
	'insert': 2,
	'instantiate': 2,
	'select': 3,
	'grab': 3,
	'delete': 4,
	'duplicate': 5,
	'arm': 6,
	'unarm': 7,
	'solo': 8,
	'unsolo': 9,
	'mute': 10,
	'unmute': 11,
	'increase': 12,
	'decrease': 13,
	'set': 14
}

export const MidiToJson = (midiArray, config) => {
	if (midiArray[0] !== 240) return;  // If the message isn't a SysEx message
	config = config || {
		'tracks': [],
		'scenes': [],
		'devices': [],
		'clips': [],
		'parameters': [],
		'instruments': [],
		'audio_devices': [],
		'midi_devices': [],
		'sel_track': null,
		'sel_device': null
	}
	midiArray = midiArray.slice(6, -1);
	return updateConfig(midiArray, config);
}

const updateConfig = (midiArray, config) => {
	/*This is the main function for updating the config, it is not complete. 
	Other options will need to be added for different attributes etc.*/

	if (midiArray[4] === VERBS['delete']) { // If the verb byte is delet
		config[NOUN_MAP[midiArray[1]]] = [] // clear the list
	}
	else if (midiArray[4] === VERBS['select']) { // If it's select, 
		config[SEL_MAP[midiArray[1]]] = convert_bytes(midiArray.slice(2, -3)) + 1 // use SEL_MAP to update the sel_device, or sel_track etc
	}
	else {
		// Loop over the bytes and convert to ASCII/String
		config[NOUN_MAP[midiArray[1]]] =
			[
				...config[NOUN_MAP[midiArray[1]]],
				...[midiArray.slice(5).reduce((acc, cur) => acc + String.fromCharCode(cur), '')]
			];
	}
	return config;
}
const convert_bytes = (byteArray) => {
	if (byteArray.length === 2) {
		return (byteArray[1] * 128) + byteArray[0];
	}
	else if (byteArray.length === 3) {
		return (byteArray[2] * 16384) + (byteArray[1] * 128) + byteArray[0];
	}
	else {
		return (byteArray[3] * 2097152) + (byteArray[2] * 16384) + (byteArray[1] * 128) + byteArray[0];
	}
}