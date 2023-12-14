import { useState, useEffect, useContext } from "react";
import BumbleBee from "bumblebee-hotword";
import { Howl, Howler } from "howler";
import useCommands from "./useCommands";
import { CleanupTranscript } from "../../utils/TranscriptUtils";
import { CommandsContext } from "../../contexts/CommandsContext";

let tb_data = require("./talkback");
Howler.autoUnlock = true;
// Setup porcupine/bumblebee
const bumblebee = new BumbleBee();
bumblebee.setWorkersPath("bumblebee-workers");
bumblebee.addHotword('computer');
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
export default function useSpeech(socketDispatch, confirm, setConfirm) {
  const [isListening, setIsListening] = useState(false);
  const [transcript, setTranscript] = useState("");
  const [actions, setActions] = useState(false);
  const { commands } = useContext(CommandsContext);
  useCommands(actions, setActions, socketDispatch, confirm, setConfirm);

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
    recognition.onspeechend = () => {
      recognition.abort();
    };

    bumblebee.on("hotword", (hotword) => {
      recognition.start();
      setIsListening(true);
      startSound.play();
    });
    bumblebee.start();
  }, []);

  useEffect(() => {
    recognition.onresult = (event) => {
      var transcript = "";
      transcript = CleanupTranscript(event.results);
      // const macro = commands.map((d) => d.command).indexOf(transcript);
      // if (macro !== -1) {
      //   console.log(commands[macro].actions);
      //   setActions(commands[macro].actions);
      // } else 
      socketDispatch(transcript, time);
      setTranscript(transcript);
      if (transcript === "stop listening") {
        setIsListening(false);
        endSound.play();
      }
      else {
        recognition.abort();
        setTimeout(function(){ recognition.start(); }, 100);
      }
    };
  }, []);

  return [isListening, transcript];
}
