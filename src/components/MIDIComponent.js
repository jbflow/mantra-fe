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
    const midiInput = Array.from(midiAccess.inputs.values())[1];
    if (!midiInput) {
      alert("No MIDI ports connected! Start LoopMIDI")
      return;
    }
    this.setState({ midiOutput: Array.from(midiAccess.outputs.values())[0] });
    this.state.midiOutput.send([240, 0, 0, 0, 0, 0, 127, 247]);
    midiInput.onmidimessage = this.getMIDIMessage;
  };

  onMIDIFailure = () => {
    console.log("MIDI Failed!");
  };

  getMIDIMessage = (msg) => {
    // Setting the new Config when MIDI message received
    this.props.setConfig(msg.data)
  };

  sendMIDIMessage = (msg) => {
    console.log(msg)
    this.state.midiOutput.send(this.props.midi);
  };

  render() {
    return null;
  }
}