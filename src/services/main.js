import { startMidi, sendMIDIMessage } from "./midiService";
import { startWebsocket } from "./socketService";
import { setWebsocket, setConfig } from "./speechService";
console.log('main');
startWebsocket(setWebsocket, sendMIDIMessage);
startMidi(setConfig);

