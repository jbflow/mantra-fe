import BumbleBee from "bumblebee-hotword";

let config, websocket;

// Setup porcupine/bumblebee
const bumblebee = new BumbleBee();
bumblebee.setWorkersPath("bumblebee-workers");
bumblebee.addHotword("hey_edison");
bumblebee.setHotword("hey_edison");
bumblebee.setSensitivity(0.5);

// Setup webspeech API
const SpeechRecognition =
  window.SpeechRecognition || window.webkitSpeechRecognition;
const recognition = new SpeechRecognition();
recognition.continuous = true;
recognition.lang = "en-GB";
recognition.interimResults = false;
recognition.maxAlternatives = 1;

recognition.onresult = (event) => {
  var transcript = "";
  for (var i = event.resultIndex; i < event.results.length; ++i) {
    transcript += event.results[i][0].transcript;
  }
  console.log(transcript);
  if (transcript.includes("stop listening")) {
    recognition.stop();
  }
  if (transcript) {
    console.log("transcript: ", transcript);
  }
  console.log("websocket", websocket);
  console.log("config", config);
  websocket.send(
    JSON.stringify({
      message: transcript,
      action: "command",
      config: config,
    })
  );
};

recognition.onspeechend = () => {
  recognition.stop();
};

bumblebee.on("hotword", (hotword) => {
  // Having to catch the error as this function is triggered twice - needs sorting...
  try {
    recognition.start();
    console.log("listening...");
  } catch (err) {
    console.log(err);
  }
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
