import React, { useEffect, useState } from "react";

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

export let updateScriptConnected;
export let updateIsListening;
export let updateTranscript;

export default function StatusBar({ midiIn, midiOut }) {
  const [micConnected, setMicConnected] = useState(false);
  const [scriptConnected, setScriptConnected] = useState(false);
  const [isListening, setIsListening] = useState(false);
  const [transcript, setTranscript] = useState("");
  const [showTranscript, setShowTranscript] = useState(true);

  useEffect(() => {
    updateScriptConnected = setScriptConnected;
    updateIsListening = setIsListening;
    updateTranscript = setTranscript;

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
          src={midiIn && midiIn !== "None" ? MidiInGood : MidiInBad}
        />
        <img
          alt=""
          className="statusItem"
          src={midiOut && midiOut !== "None" ? MidiOutGood : MidiOutBad}
        />
        <img alt="" className="statusItem" src={micConnected ? Mic : MicMute} />
        <img
          alt=""
          className="statusItem"
          src={scriptConnected ? DawLinkGood : DawLinkBad}
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
          {transcript || "Open new track..."}
        </div>
        <img alt="" src={isListening ? TlkBckListening : TlkBckNotListening} />
        <div
          style={{
            minWidth: 48,
          }}
        />
      </div>
    </div>
  );
}
