import React from "react";

export default class MIDIComponent extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      midiInput: null,
      midiOutput: null,
    };
  }

  componentDidMount() {
    this.requestMIDI();
  }

  componentDidUpdate() {
    if (this.state.midiOutput && this.props.midi) {
      this.sendMIDIMessage(this.props.midi);
    }
  }

  requestMIDI = () => {
    navigator
      .requestMIDIAccess({ sysex: true })
      .then(this.onMIDISuccess, this.onMIDIFailure);
  };

  onMIDISuccess = (midiAccess) => {
    const midiInput = Array.from(midiAccess.inputs.values())[0];
    this.setState({ midiOutput: Array.from(midiAccess.outputs.values())[1] });
    midiInput.onmidimessage = this.getMIDIMessage;
  };

  onMIDIFailure = () => {
    console.log("MIDI Failed!");
  };

  getMIDIMessage = (msg) => {
    const config_payload = { message: [240, 0, 0, 0, 0, 0, 127, 247], type: "config" }; // no response
    const command_payload = { message: "sometext", type: "command" }; // respond with command_response below
    const commmand_response = { message: [240, 1, 0, 0, 0, 0, 127, 247], type: "midi_command" }; // reponse from command


    this.props.websocket.send(
      JSON.stringify(config_payload)
    );
  };

  sendMIDIMessage = (msg) => {
    console.log(msg)
    this.state.midiOutput.send(this.props.midi);
  };

  render() {
    return null;
  }
}
