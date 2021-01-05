import { startMidi, sendMIDIMessage } from "./midiService";
import { startWebsocket, ws } from "./socketService";
import { setWebsocket, setConfig } from "./speechService";
console.log('main');
startWebsocket(setWebsocket, sendMIDIMessage);
startMidi(setConfig);

export const getWebSocket = () => {
	return ws;
}

