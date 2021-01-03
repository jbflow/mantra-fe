import React from "react";
import BumbleBee from "bumblebee-hotword";

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

export default class SpeechComponent extends React.Component {
  constructor(props) {
    super(props);
    this.state = {};

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
      }



      // const command_payload = { message: "sometext", action: "command" }; // respond with command_response below
      // const commmand_response = { message: [240, 1, 0, 0, 0, 0, 127, 247], action: "midi_command" }; // reponse from command

      this.props.websocket.send(
        JSON.stringify({
          message: transcript,
          action: "command",
        })
      );
    };

    recognition.onspeechend = () => {
      recognition.stop();
      this.listening = false;
    };

    bumblebee.on("hotword", (hotword) => {
      // Having to catch the error as this function is triggered twice - needs sorting...
      try {
        recognition.start();
      } catch (err) {
        console.log(err);
      }
    });

    bumblebee.start();
  }
  render() {
    return null;
  }
}
