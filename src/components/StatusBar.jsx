import React, { useEffect, useState } from "react";

import Mic from "../images/mic-fill.svg";
import MicMute from "../images/mic-mute-fill.svg";
import DawLinkGood from "../images/daw-link-good.svg";
import DawLinkBad from "../images/daw-link-bad.svg";
import webSocket from "../images/websocket.svg"
import webSocketBad from "../images/websocket-bad.svg"
import "../styles/StatusBar.css"

export default function StatusBar({isConnected, dawLink }) {
  const [micConnected, setMicConnected] = useState(false);
  useEffect(() => {
    const constraints = { audio: true };
    navigator.mediaDevices.getUserMedia(constraints).then(() => {
      setMicConnected(true);
    });
  }, []);

  return (
    <div className="status-icon-container fixed-bottom">
      <div className="d-flex flex-row justify-content-center align-items-center">
        
        <div className="statusItem" role="img" aria-label={micConnected ? "microphone access toggle on" : "microphone access toggle off, please allow mic access"}>
          <img alt="" src={micConnected ? Mic : MicMute} />
        </div>

        <div className="statusItem" role="img" aria-label={isConnected ? "Websocket icon toggle on" : "websocket icon toggle off"}>
          <img alt="" src={isConnected ? webSocket : webSocketBad} style={{width: "1.8rem"}} />
        </div>

        <div className="statusItem" role="img" aria-label={dawLink ? "DAW connection toggle on" : "midi out toggle off"}>
          <img alt=""src={dawLink ? DawLinkGood : DawLinkBad}/>
        </div>
      </div>
    </div>
  );
}
