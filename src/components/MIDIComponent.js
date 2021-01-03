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
<<<<<<< HEAD
    const midiInput = Array.from(midiAccess.inputs.values())[1];
    this.setState({ midiOutput: Array.from(midiAccess.outputs.values())[0] });
=======
    const midiInput = Array.from(midiAccess.inputs.values())[0];
    if (!midiInput) {
      alert("No MIDI ports connected! Start LoopMIDI")
      return;
    }
    this.setState({ midiOutput: Array.from(midiAccess.outputs.values())[1] });
>>>>>>> b2174c71793e950edc0660f786acacb0a075335c
    midiInput.onmidimessage = this.getMIDIMessage;
  };

  onMIDIFailure = () => {
    console.log("MIDI Failed!");
  };

  getMIDIMessage = (msg) => {
    console.log(Array.from(msg.data))
    this.props.websocket.send(
      JSON.stringify({ message: Array.from(msg.data), action: "config" })
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