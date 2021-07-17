import React, { useEffect, useState, useContext } from "react";

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

import { ServicesContext } from "../contexts/ServicesContext";

export default function StatusBar() {
  const { status } = useContext(ServicesContext);
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
      <div className="d-flex flex-row justify-content-end align-items-center">
        <img
          alt=""
          className="statusItem"
          src={status.midiInputOpen ? MidiInGood : MidiInBad}
        />
        <img
          alt=""
          className="statusItem"
          src={status.midiOutputOpen ? MidiOutGood : MidiOutBad}
        />
        <img alt="" className="statusItem" src={micConnected ? Mic : MicMute} />
        <img
          alt=""
          className="statusItem"
          src={status.dawLink ? DawLinkGood : DawLinkBad}
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
          {status.transcript}
        </div>
        <img
          alt=""
          src={status.isListening ? TlkBckListening : TlkBckNotListening}
        />
        <div
          style={{
            minWidth: 48,
          }}
        />
      </div>
    </div>
  );
}
