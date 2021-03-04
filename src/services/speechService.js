import BumbleBee from "bumblebee-hotword";
import { Howl, Howler } from "howler";
import {
  updateMicConnected,
  updateIsListening,
  updateTranscript,
} from "../components/StatusBar";

let config, websocket;

Howler.autoUnlock = true;
// const playAlert = require("alert-sound-notify");

// Setup porcupine/bumblebee
const bumblebee = new BumbleBee();
bumblebee.setWorkersPath("bumblebee-workers");
bumblebee.addHotword("hey_edison");
bumblebee.setHotword("hey_edison");
bumblebee.setSensitivity(0.7);

// Setup webspeech API
const SpeechRecognition = window.webkitSpeechRecognition;
const recognition = new SpeechRecognition();
var grammar =
  "#JSGF V1.0; grammar phrases; public <phrase> = select the bass | track 1 | track 2 | arm track 1 | bass | arm | arm track | 1 to | load a;";
const SpeechGrammarList = window.webkitSpeechGrammarList;
var speechRecognitionList = new SpeechGrammarList();
speechRecognitionList.addFromString(grammar, 1);
recognition.continuous = true;
recognition.lang = "en-GB";
recognition.interimResults = false;
recognition.maxAlternatives = 1;

const startSound = new Howl({ src: ["sounds/start_sound.mp3"] });
const endSound = new Howl({ src: ["sounds/stop_sound.mp3"] });

const constraints = { audio: true };

navigator.mediaDevices.getUserMedia(constraints).then(() => {
  updateMicConnected(true);
});

recognition.onstart = () => {
  updateIsListening(true);
  startSound.play();
};

recognition.onend = () => {
  updateIsListening(false);
  endSound.play();
};

recognition.onresult = (event) => {
  var transcript = "";
  for (var i = event.resultIndex; i < event.results.length; ++i) {
    transcript += event.results[i][0].transcript;
  }

  if (transcript.includes("stop listening")) {
    recognition.stop();
  }
  if (transcript) {
    updateTranscript(transcript);
  }

  console.log("config", config);

  websocket.send(
    JSON.stringify({
      message: transcript,
      action: "command",
      config: config,
      userId: localStorage.getItem("userId"),
    })
  );
};

recognition.onspeechend = () => {
  recognition.stop();
};

bumblebee.on("hotword", (hotword) => {
  recognition.start();
  console.log("listening...");
});

bumblebee.start();

export const setConfig = (newconfig) => {
  config = newconfig;
};
export const getConfig = () => {
  return config;
};
export const setWebsocket = (ws) => {
  console.log("setWebsocket: ", ws);
  websocket = ws;
};
