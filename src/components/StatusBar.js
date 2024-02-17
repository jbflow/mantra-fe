import React, { useEffect, useState } from "react";

import { Link } from "react-router-dom";




import MidiInGood from "../images/MIDI-in-good.svg";
import MidiInBad from "../images/MIDI-in-bad.svg";
import MidiOutGood from "../images/MIDI-out-good.svg";
import MidiOutBad from "../images/MIDI-out-bad.svg";
import Mic from "../images/mic-fill.svg";
import MicMute from "../images/mic-mute-fill.svg";
import DawLinkGood from "../images/daw-link-good.svg";
import DawLinkBad from "../images/daw-link-bad.svg";
import TlkBckListening from "../images/tlkbck-listening.svg";
import TlkBckNotListening from "../images/tlkbck-not-listening.svg";
import SmartPhone from "../images/smartphone.svg";
import "../styles/StatusBar.css"

export default function StatusBar({connectionStatus}) {
  const [micConnected, setMicConnected] = useState(false);
  const [showTranscript, setShowTranscript] = useState(true);

  useEffect(() => {
    const constraints = { audio: true };
    navigator.mediaDevices.getUserMedia(constraints).then(() => {
      setMicConnected(true);
    });
  }, []);

  return (
    <div className="fixed-bottom w-100 " style={{ backgroundColor: "#7A7E83" }}>
      <div className="d-flex flex-row justify-content-between align-items-center">
        <div className="d-flex flex-row">
        <Link className="connect-mobile-btn row" to="/connect-phone">
          <img
            alt=""
            className="statusItem"
            src={SmartPhone}
            style={{ marginRight: "unset", height: "3rem", filter: "invert(100%) sepia(0%) saturate(0%) hue-rotate(108deg) brightness(110%) contrast(101%)" }}
          />
        </Link>
        <p className="text-white px-4" style={{margin: "auto"}}>{connectionStatus}</p>
        </div>
        <div className="d-flex flex-row justify-content-end align-items-center">
          <img
            alt=""
            className="statusItem"
            src={true ? MidiInGood : MidiInBad} // Update me
          />
          <img
            alt=""
            className="statusItem"
            src={true ? MidiOutGood : MidiOutBad} // Update me
          />
          <img alt="" className="statusItem" src={micConnected ? Mic : MicMute} />
          <img
            alt=""
            className="statusItem"
            src={true ? DawLinkGood : DawLinkBad} // Update me
          />
          <div
            style={{
              minHeight: 48,
              backgroundColor: "#656A6F",
              padding: 12,
              color: "white",
              cursor: "pointer",
            }}
            onClick={() => {
              setShowTranscript(!showTranscript);
            }}
          >
            {showTranscript ? ">" : "<"}
          </div>
          <div
            className="font-weight-light"
            style={{
              display: showTranscript ? "inline-block" : "none",
              backgroundColor: "#595E63",
              minHeight: 48,
              maxWidth: 300,
              minWidth: 300,
              padding: 12,
              color: "white",
            }}
          >
            {"transcript goes here"}
          </div>
          <img
            alt=""
            src={true ? TlkBckListening : TlkBckNotListening}
          />
          <div
            style={{
              minWidth: 48,
            }}
          />
        </div>
      </div>
    </div>
  );
}
