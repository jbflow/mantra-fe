import React, { useState, useEffect } from 'react';
import useWebSocket, { ReadyState } from 'react-use-websocket';

import TopBar from "./components/TopBar";
import SpeechDetector from "./components/SpeechDetector";
import { clearConfig, arraysEqual } from './utils/utils';
import { emptyConfig } from './utils/MidiConstants';
import { MidiToJson } from './utils/MidiToJson';


import { TranscriptParser } from "./utils/TranscriptParser";
import { IntentDetection } from "./intent_detection/IntentDetection";
import MobileRTC from './components/MobileRTC';



const transcriptParser = new TranscriptParser()
const detector = new IntentDetection()



function MobileApp({ signOut }) {
  // const [transcript, setTranscript] = useState("")
  // const [finalTranscript, setFinalTranscript] = useState("...")
  // const [alternatives, setAlternatives] = useState([])
  // const [listening, setListening] = useState(false)
  // const [config, setConfig] = useState(emptyConfig)
  // const { sendMessage, lastMessage, readyState } = useWebSocket("wss://192.168.1.158:8080");

  // useEffect(() => {
  //   console.log("READY STATE", readyState)

  //   if (readyState === ReadyState.OPEN) {
  //     sendMessage(JSON.stringify({ type: "command", data: [240, 0, 0, 0, 0, 0, 1, 247] }));
  //   }
  // }, [readyState])


  // useEffect(() => {
  //   if (lastMessage !== null) {
  //     const msg = JSON.parse(lastMessage.data)
  //     const init = [240, 0, 0, 0, 0, 0, 127, 247];
  //     if (arraysEqual(init, Array.from(msg))) {
  //       // if message is init
  //       clearConfig(); // clear config
  //       setConfig(emptyConfig); // set it to empty
  //       sendMessage(JSON.stringify({ type: "command", data: [240, 0, 0, 0, 0, 0, 1, 247] })); // return msg to initialize
  //     } else if (!arraysEqual(Array.from(msg.data), init) && msg.data[6] === 0) {
  //       // if message is not init and is a config update
  //       let configStore = Object.assign({}, config); // make a copy of the config
  //       setConfig(MidiToJson(msg.data, configStore)); // and update it
  //     }
  //   }
  // }, [lastMessage]);

  // useEffect(() => {
  //   if (alternatives.length !== 0) {
  //     const final = transcriptParser.cleanupTranscript(alternatives);
  //     if (final) {
  //       const midiMessage = detector.runDetection(final, config)
  //       sendMessage(JSON.stringify({ type: "command", data: midiMessage }))
  //       setTranscript(final);
  //     }
      
  //   }
  // }, [alternatives])


  // const backgroundColor = listening ? "#1477fc" : "#7A7E83"


  return (
    <>
      {/* <TopBar /> */}
      {/* <SpeechDetector setTranscript={setTranscript} setAlternatives={setAlternatives} setListening={setListening} backgroundColor={backgroundColor} />
      <div style={{ display: "flex", flexDirection: "column", alignItems: "center" }}>
        <p className="pt-5 px-3 h3 font-italic" style={{ color: backgroundColor }}>{transcript !== "" ? `"${transcript}"` : "..."}</p>
      </div> */}
      <MobileRTC/>

    </>
  );
}

export default MobileApp;
