import React, { Component, Fragment } from "react";
import { setportNames } from "../services/midiService";
import "../styles/App.css";

export default class Preferences extends Component {
  constructor(props) {
    super(props);
    const globalVar = this;
    this.state = {
      midiInputs: [],
      midiOutputs: [],
    };
  }

  setMidiPorts = (inputs, outputs) => {
    inputs.forEach((input) => {
      this.setState({ midiInputs: [...this.state.midiInputs, input.name] });
    });
    outputs.forEach((output) => {
      this.setState({ midiOutputs: [...this.state.midiOutputs, output.name] });
    });
  };

  midiOutChanged = (e) => {
    setportNames("test", e.target.value); // set the selected port inside the midiservice, need to handle opening and closing
  };

  midiInChanged = (e) => {
    console.log(e.target.value);
  };

  render() {
    return (
      <Fragment>
        <div
          className="card border-primary mb-3"
          style={{ height: "250px", margin: "10px" }}
        >
          <div className="card-header">Interface</div>
          <div className="card-body">
            <h4 className="card-title">
              Preferences that control how talkbak looks and feels
            </h4>
            <p className="card-text"></p>
          </div>
        </div>

        <div
          className="card border-primary mb-3"
          style={{ height: "250px", margin: "10px" }}
        >
          <div className="card-header">Operation</div>
          <div className="card-body">
            <p className="card-text"></p>

            <div className="form-group">
              <label>MIDI In</label>

              <select className="form-control" id="midiIn">
                {this.state.midiInputs.map((input) => (
                  <option key={input}>{input}</option>
                ))}
              </select>

              <label>MIDI Out</label>
              <select
                className="form-control"
                id="midiOut"
                onChange={this.midiOutChanged}
              >
                {this.state.midiOutputs.map((output) => (
                  <option key={output}>{output}</option>
                ))}
              </select>
            </div>
          </div>
        </div>

        <div
          className="card border-primary mb-3"
          style={{ height: "250px", margin: "10px" }}
        >
          <div className="card-header">Intent Detection</div>
          <div className="card-body">
            <h4 className="card-title">
              Preferences that affect the intent detection engine, defaults etc
            </h4>
            <p className="card-text"></p>
          </div>
        </div>
      </Fragment>
    );
  }
}
