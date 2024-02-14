import React, { useState, useCallback, useEffect } from 'react';
import useWebSocket, { ReadyState } from 'react-use-websocket';
import TopBar from "./components/TopBar";
import SpeechDetector from "./components/SpeechDetector";
import { clearConfig, arraysEqual } from './utils/utils';
import { emptyConfig } from './utils/MidiConstants';
import { MidiToJson } from './utils/MidiToJson';
function MobileApp({ signOut }) {
  const [transcript, setTranscript] = useState("")
  const [config, setConfig] = useState(emptyConfig)
  const { sendMessage, lastMessage, readyState } = useWebSocket("ws://localhost:8080");




  useEffect(() => {
    if (readyState === ReadyState.OPEN) {
      sendMessage(JSON.stringify({ type: "command", data: [240, 0, 0, 0, 0, 0, 1, 247] }));
    }
  }, [readyState])


  useEffect(() => {
    if (lastMessage !== null) {
      const msg = JSON.parse(lastMessage.data)
      const init = [240, 0, 0, 0, 0, 0, 127, 247];
      if (arraysEqual(init, Array.from(msg))) {
        // if message is init
        clearConfig(); // clear config
        setConfig(emptyConfig); // set it to empty
        sendMessage(JSON.stringify({ type: "command", data: [240, 0, 0, 0, 0, 0, 1, 247] })); // return msg to initialize
      } else if (!arraysEqual(Array.from(msg.data), init) && msg.data[6] === 0) {
        // if message is not init and is a config update
        let configStore = Object.assign({}, config); // make a copy of the config
        setConfig(MidiToJson(msg.data, configStore)); // and update it
      }
    }
  }, [lastMessage]);

  return (
    <>
      <TopBar />
      <SpeechDetector setTranscript={setTranscript} />

    </>
  );
}

export default MobileApp;
