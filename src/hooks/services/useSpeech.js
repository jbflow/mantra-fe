import { useState, useEffect } from "react";
import BumbleBee from "bumblebee-hotword";
import { Howl, Howler } from "howler";

import CleanupTranscript from "../../utils/CleanupTranscript";

let tb_data = require("./talkback");
Howler.autoUnlock = true;
// Setup porcupine/bumblebee
const bumblebee = new BumbleBee();
bumblebee.setWorkersPath("bumblebee-workers");
bumblebee.addHotword("talkback", tb_data, 0.7);
bumblebee.setHotword("talkback");

// Setup webspeech API
const SpeechRecognition = window.webkitSpeechRecognition;
const recognition = new SpeechRecognition();
recognition.continuous = true;
recognition.lang = "en-GB";
recognition.interimResults = false;
recognition.maxAlternatives = 20;

const startSound = new Howl({ src: ["sounds/start_sound.mp3"] });
const endSound = new Howl({ src: ["sounds/stop_sound.mp3"] });

let interval;
let time = 0;
export default function useSpeech(websocket, config, userId, lastSubject) {
  const [isListening, setIsListening] = useState(false);
  const [transcript, setTranscript] = useState("");
  const [speechTime, setSpeechTime] = useState(0);

  useEffect(() => {
    if (isListening) {
      interval = setInterval(() => {
        time = time + 10;
      }, 10);
    } else {
      clearInterval(interval);
    }
  }, [isListening]);

  useEffect(() => {
    recognition.onstart = () => {
      setIsListening(true);
      startSound.play();
    };

    recognition.onend = () => {
      setIsListening(false);
      endSound.play();
    };

    recognition.onresult = (event) => {
      recognition.abort();
      var transcript = "";

      transcript = CleanupTranscript(event.results);

      if (transcript) {
        setTranscript(transcript);
      }

      // if (transcript.includes("stop listening")) {
      //   return;
      // } else {
      //   websocket.current.send(
      //     JSON.stringify({
      //       message: transcript,
      //       config: config,
      //       action: "command",
      //       userId: userId,
      //       last_subject: lastSubject,
      //       time: time,
      //     })
      //   );
      // }
      // time = 0;
    };

    recognition.onspeechend = () => {
      recognition.abort();
    };

    bumblebee.on("hotword", (hotword) => {
      recognition.start();
    });
    bumblebee.start();
  }, []);

  return [isListening, transcript];
}
