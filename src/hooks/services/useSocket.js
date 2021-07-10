import { useState, useEffect, useRef } from "react";
import { WEBSOCKET_API_URL } from "../../utils/Constants";

let connectInterval = null;
let timeout = 250;

export default function useSocket(sendMIDIMessage) {
  const websocket = useRef(null);
  const [lastSubject, setLastSubject] = useState(null);
  const [totalTime, setTotalTime] = useState(0);
  const [totalCommands, setTotalCommands] = useState(0);

  const connectWebSocket = () => {
    const ws = new WebSocket(WEBSOCKET_API_URL);
    // websocket onopen event listener
    ws.onopen = () => {
      clearInterval(connectInterval); // clear Interval on on open of websocket connection
    };

    ws.onmessage = (e) => {
      const data = JSON.parse(e.data);
      setLastSubject(data.last_subject);
      setTotalTime(data.time);
      setTotalCommands(data.total_commands);
      sendMIDIMessage(data.command);
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
      console.error(
        "Socket encountered error: ",
        err.message,
        "Closing socket"
      );

      ws.close();
    };
    return ws;
  };

  const check = () => {
    if (!websocket || websocket.readyState === WebSocket.CLOSED)
      connectWebSocket(); //check if websocket instance is closed, if so call `connect` function.
  };

  useEffect(() => {
    connectInterval = setInterval(check, timeout);
    websocket.current = connectWebSocket();
    return () => {
      websocket.current.close();
    };
  }, []);

  return [websocket, lastSubject, totalTime, totalCommands];
}
