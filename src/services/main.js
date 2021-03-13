import { startMidi, sendMIDIMessage } from "./midiService";
import { startWebsocket, ws } from "./socketService";
import { setWebsocket, setConfig, getConfig } from "./speechService";
console.log('main');

requestAnimationFrame(() => {
	startWebsocket(setWebsocket, sendMIDIMessage);
	startMidi(setConfig);
})

export const getWebSocket = () => {
	return ws;
}

export const getConfigFunction = getConfig

