import { useState, useEffect, useContext } from "react";
import BumbleBee from "bumblebee-hotword";
import { Howl, Howler } from "howler";
import useCommands from "./useCommands";
import { TranscriptParser } from "../../utils/TranscriptParser";
import { CommandsContext } from "../../contexts/CommandsContext";
import { IntentDetection } from "../../intent_detection/IntentDetection";



const transcriptParser = new TranscriptParser()
const detector = new IntentDetection()
let tb_data = require("./talkback");
Howler.autoUnlock = true;
// Setup porcupine/bumblebee
const bumblebee = new BumbleBee();
bumblebee.setWorkersPath("bumblebee-workers");
bumblebee.addHotword("computer");
bumblebee.setHotword("computer");

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
export default function useSpeech(config, sendMIDIMessage) {
  const [isListening, setIsListening] = useState(false);
  const [transcript, setTranscript] = useState("");
  const [actions, setActions] = useState(false);
  const { commands } = useContext(CommandsContext);
  
  // useCommands(actions, setActions, confirm, setConfirm);



  useEffect(() => {
    recognition.onstart = () => {
      setIsListening(true);
      startSound.play();
    };

    recognition.onend = () => {
      setIsListening(false);
      endSound.play();
    };

    recognition.onspeechend = () => {
      recognition.abort();
    };

    bumblebee.on("hotword", (hotword) => {
      recognition.start();
    });
    bumblebee.start();
  }, []);

  useEffect(() => {
    recognition.onresult = (event) => {

      let transcript = "";
      for (let i = event.resultIndex; i < event.results.length; ++i) {

        transcript += event.results[i]

      }
      if (transcript.includes("stop listening")) {
        recognition.stop()
      }
      console.log("RESULTS", event.results)
      console.log("TRANSCRIPT", transcript)
      console.log("RESULTINDEX", event.resultIndex)

      const final = transcriptParser.cleanupTranscript(event);
      console.log("FINAL", final)
      if (final) {
        const midiMessage = detector.runDetection(final, config)
        console.log(midiMessage)
        sendMIDIMessage(midiMessage)
        setTranscript(final);
      }

    };
  }, [commands]);

  return [isListening, transcript];
}