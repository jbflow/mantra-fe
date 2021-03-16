import { WEBSOCKET_API_URL } from "../utils/Constants";

export var ws = null;
let connectInterval = null;
let timeout = 250;
let midi = null;
let sendMIDIMessage = null;

/**
 * utilited by the @function connect to check if the connection is close, if so attempts to reconnect
 */
const check = () => {
  if (!ws || ws.readyState === WebSocket.CLOSED) connectWebSocket(); //check if websocket instance is closed, if so call `connect` function.
};

/**
 * @function connect
 * This function establishes the connect with the websocket and also ensures constant reconnection if connection closes
 */
const connectWebSocket = () => {
  ws = new WebSocket(WEBSOCKET_API_URL);

  // websocket onopen event listener
  ws.onopen = () => {
    clearInterval(connectInterval); // clear Interval on on open of websocket connection
  };

  ws.onmessage = (e) => {
    console.log("e: ", e);
    const data = JSON.parse(e.data);
    console.log("data: ", data);
    midi = data["command"];
    const lastSubject = data["last_subject"];
    localStorage.setItem("last_subject", lastSubject);
    console.log("midi: ", midi);
    sendMIDIMessage(midi);
  };

  // websocket onclose event listener
  ws.onclose = (e) => {
    console.log(
      `Socket is closed. Reconnect will be attempted in ${
        Math.min(timeout) / 1000
      } second.`,
      e.reason
    );
  };

  // websocket onerror event listener
  ws.onerror = (err) => {
    console.error("Socket encountered error: ", err.message, "Closing socket");

    ws.close();
  };
  return ws;
};

export const startWebsocket = (setWebsocket, sendMIDI) => {
  setWebsocket(connectWebSocket());
  sendMIDIMessage = sendMIDI;
  connectInterval = setInterval(check, 250);
};
