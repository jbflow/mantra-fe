import React, { useEffect, useState } from "react";
import MidiInGood from "../images/MIDI-in-good.svg";
import MidiInBad from "../images/MIDI-in-bad.svg";
import MidiOutGood from "../images/MIDI-out-good.svg";
import MidiOutBad from "../images/MIDI-out-bad.svg";
import Mic from "../images/mic-fill.svg";
import MicMute from "../images/mic-mute-fill.svg";
import DawLinkGood from "../images/daw-link-good.svg";
import DawLinkBad from "../images/daw-link-bad.svg";
import "../styles/StatusBar.css"

export default function StatusBar({ connectionStatus, dawLink, midiIn, midiOut }) {
  const [micConnected, setMicConnected] = useState(false);
  useEffect(() => {
    const constraints = { audio: true };
    navigator.mediaDevices.getUserMedia(constraints).then(() => {
      setMicConnected(true);
    });
  }, []);

  return (
    <div className="status-icon-container fixed-bottom">
      <div className="d-flex flex-row justify-content-end align-items-center">
        <div className="statusItem" role="img" aria-label={midiIn ? "midi in toggle on" : "midi in toggle off"}>
          <img
            alt=""

            src={midiIn ? MidiInGood : MidiInBad}
          />
        </div>
        <div className="statusItem" role="img" aria-label={midiOut ? "midi out toggle on" : "midi out toggle off"}>
          <img
            alt=""

            src={midiOut ? MidiOutGood : MidiOutBad}
          />
        </div>
        <div className="statusItem" role="img" aria-label={micConnected ? "microphone access toggle on" : "microphone access toggle off, please allow mic access"}>
          <img alt="" src={micConnected ? Mic : MicMute} />
        </div>

        <div className="statusItem" role="img" aria-label={dawLink ? "DAW connection toggle on" : "midi out toggle off"}>
          <img
            alt=""

            src={dawLink ? DawLinkGood : DawLinkBad}
          />
        </div>
      </div>
    </div>
  );
}
