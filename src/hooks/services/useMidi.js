import { useState, useEffect, useRef } from "react";
import { arraysEqual, clearConfig } from "../../utils/utils";
import { MidiToJson } from "../../utils/MidiToJson";
import { emptyConfig } from "../../utils/MidiConstants";

let midiInputs;
let midiOutputs;
let midiInput;
let midiOutput;

export default function useMidi() {
  const [midiInputOpen, setMidiInput] = useState(null);
  const [midiOutputOpen, setMidiOutput] = useState(null);
  const [dawLink, setDawLink] = useState(false);
  const [config, setConfig] = useState(emptyConfig);
  const [confirm, setConfirm] = useState([]);
  const confirmRef = useRef(false);
  const [configTimer, setConfigTimer] = useState(0);
  const interval = useRef(null);

  useEffect(() => {
    // Effect for the config timer, if the timer has started, and there hasn't been a config message for 100 ms
    if (configTimer >= 100) {
      clearInterval(interval.current); // stop the interval
      interval.current = false; // and set it to false
      setConfirm(confirmRef.current); // store the confirmation message to state
      confirmRef.current = false; // return to the ref to false
      setConfigTimer(0); // now reset the timer reset the timer
    }
  }, [configTimer, interval]);

  const sendMIDIMessage = (msg) => {
    if (msg) {
      midiOutput.send(msg);
    }
  };

  const getMIDIMessage = (msg) => {
    const init = [240, 0, 0, 0, 0, 0, 127, 247];
    if (arraysEqual(init, Array.from(msg.data))) {
      // if message is init
      clearConfig(); // clear config
      setConfig(emptyConfig); // set it to empty
      sendMIDIMessage([240, 0, 0, 0, 0, 0, 1, 247]); // return msg to initialize
    } else if (!arraysEqual(Array.from(msg.data), init) && msg.data[6] === 0) {
      // if message is not init and is a config update
      let configStore = Object.assign({}, config); // make a copy of the config
      setConfig(MidiToJson(msg.data, configStore)); // and update it

      if (confirmRef.current) {
        console.log("resetting timer to 0");
        setConfigTimer(0);
      } // If there is a confirmRef message (a voice command has sent a response confirmation)
      // set the configTimer back to 0, once config is done, Timer will exceed 100
      if (!dawLink) {
        setDawLink(true); // Turn on the DawLink light
      }
    } else if (msg.data[6] === 96) {
      // If the message is a confirmation, store it as a ref and create a 50ms timer
      if (interval.current) {
        clearInterval(interval.current);
        setConfirm(confirmRef.current);
        interval.current = false;
      }
      interval.current = setInterval(() => {
        setConfigTimer((prevTime) => prevTime + 50);
      }, 50);
      confirmRef.current = msg.data;
    }
  };

  const onMIDISuccess = (midiAccess) => {
    midiInputs = Array.from(midiAccess.inputs.values());
    midiOutputs = Array.from(midiAccess.outputs.values());

    midiOutputs.forEach((output) => {
      if (output.name == "tlkbck") {
        output.open();
        midiOutput = output;
        setMidiOutput(true);
        sendMIDIMessage([240, 0, 0, 0, 0, 0, 1, 247]);
      }
    });
    midiInputs.forEach((input) => {
      if (input.name == "tlkbck") {
        midiInput = input;
        input.onmidimessage = getMIDIMessage;
        setMidiInput(true);
      }
    });
  };

  const onMIDIFailure = () => {
    console.log("MIDI Failed!");
  };

  useEffect(() => {
    navigator
      .requestMIDIAccess({ sysex: true })
      .then(onMIDISuccess, onMIDIFailure);
  }, []);

  return [
    midiInputOpen,
    midiOutputOpen,
    sendMIDIMessage,
    dawLink,
    config,
    confirm,
    setConfirm,
  ];
}
