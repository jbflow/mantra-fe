import { useState, useEffect, useRef, useContext } from "react";
import { WEBSOCKET_API_URL } from "../../utils/Constants";

import { UserContext } from "../../contexts/UserContext";

let connectInterval = null;
let timeout = 250;

export default function useSocket(sendMIDIMessage, config) {
  const websocket = useRef(null);
  const [lastSubject, setLastSubject] = useState(null);
  const [totalTime, setTotalTime] = useState(0);
  const [totalCommands, setTotalCommands] = useState(0);
  const userId = useContext(UserContext).userId;

  const connectWebSocket = () => {
    const ws = new WebSocket(WEBSOCKET_API_URL);
    // websocket onopen event listener
    ws.onopen = () => {
      clearInterval(connectInterval); // clear Interval on on open of websocket connection
    };

    ws.onmessage = (e) => {
      const data = JSON.parse(e.data);
      console.log(data.command);
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

  const socketDispatch = (message, time) => {
    websocket.current.send(
      JSON.stringify({
        message: message,
        config: config,
        action: "command",
        userId: userId,
        last_subject: lastSubject,
        time: time,
      })
    );
  };

  useEffect(() => {
    connectInterval = setInterval(check, timeout);
    websocket.current = connectWebSocket();
    return () => {
      websocket.current.close();
    };
  }, []);

  return [socketDispatch, totalTime, totalCommands];
}
