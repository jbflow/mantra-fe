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
    this.props.websocket.send(
      JSON.stringify({ message: Array.from(msg.data), type: "config" })
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
