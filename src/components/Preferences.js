import React, { Component, Fragment } from "react";
import { setInPort, setOutPort } from "../services/midiService";
import "../styles/App.css";

export default class Preferences extends Component {
  constructor(props) {
    super(props);
    this.state = {
      midiInputs: [],
      midiOutputs: [],
      audioInputs: [],
      audioOutputs: [],
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
    setOutPort(e.target.value); // set the selected port inside the midiservice, need to handle opening and closing
  };

  midiInChanged = (e) => {
    setInPort(e.target.value);
  };

  render() {
    return (
      <Fragment>
        <div className="card border-primary mb-3" style={{ margin: "10px" }}>
          <div className="card-header">Preferences</div>
          <div className="card-body">
            <h3>Look/Feel</h3>
            <table className="table table-sm">
              <colgroup>
                <col span="1" style={{ width: "15%" }}></col>
                <col span="1" style={{ width: "35%" }}></col>
                <col span="1" style={{ width: "15%" }}></col>
                <col span="1" style={{ width: "35%" }}></col>
              </colgroup>

              <tr>
                <td>
                  <p>Dark/Light</p>
                </td>
                <td>
                  <button className="btn-primary">Dark</button>
                </td>
                <td>
                  <p>Magnifaction</p>
                </td>
                <td>
                  <button className="btn-primary">On</button>
                </td>
              </tr>
            </table>
            <h3>Ins/Outs</h3>
            <table className="table table-sm">
              <colgroup>
                <col span="1" style={{ width: "15%" }}></col>
                <col span="1" style={{ width: "35%" }}></col>
                <col span="1" style={{ width: "15%" }}></col>
                <col span="1" style={{ width: "35%" }}></col>
              </colgroup>
              <tr>
                <td>
                  <p>MIDI In</p>
                </td>
                <td>
                  <select
                    className="form-control"
                    id="midiIn"
                    onChange={this.midiOutChanged}
                  >
                    {this.state.midiInputs.map((input) => (
                      <option key="MidiIn">{input}</option>
                    ))}
                  </select>
                </td>
                <td>
                  <p>MIDI Out</p>
                </td>
                <td>
                  <select
                    className="form-control"
                    id="midiOut"
                    onChange={this.midiOutChanged}
                  >
                    {this.state.midiOutputs.map((output) => (
                      <option key="MidiOut">{output}</option>
                    ))}
                  </select>
                </td>
              </tr>

              <tr>
                <td>
                  <p>Audio In</p>
                </td>
                <td>
                  <select className="form-control" id="audioIn">
                    {this.state.audioInputs.map((input) => (
                      <option key="AudioIn">{input}</option>
                    ))}
                  </select>
                </td>
                <td>
                  <p>Audio Out</p>
                </td>
                <td>
                  <select className="form-control" id="audioOut">
                    {this.state.audioOutputs.map((output) => (
                      <option key="AudioOut">{output}</option>
                    ))}
                  </select>
                </td>
              </tr>
            </table>

            <h3>Intent Engine</h3>
            <table className="table table-sm">
              <colgroup>
                <col span="1" style={{ width: "15%" }}></col>
                <col span="1" style={{ width: "35%" }}></col>
                <col span="1" style={{ width: "15%" }}></col>
                <col span="1" style={{ width: "35%" }}></col>
              </colgroup>

              <tr>
                <td>
                  <p>Increment Default</p>
                </td>
                <td></td>
                <td>
                  <p>Decrement Default</p>
                </td>
                <td></td>
              </tr>

              <tr>
                <td>
                  <p>Track Default</p>
                </td>
                <td></td>
                <td>
                  <p>Device Default</p>
                </td>
                <td></td>
              </tr>
              <tr>
                <td>
                  <p>Priority Hierachy</p>
                </td>
                <td></td>
                <td></td>
                <td></td>
              </tr>
            </table>
            <h3>Speech</h3>
            <table className="table table-sm">
              <colgroup>
                <col span="1" style={{ width: "15%" }}></col>
                <col span="1" style={{ width: "35%" }}></col>
                <col span="1" style={{ width: "15%" }}></col>
                <col span="1" style={{ width: "35%" }}></col>
              </colgroup>

              <tr>
                <td>
                  <p>Speech Rate</p>
                </td>
                <td>
                  <fieldset class="form-group">
                    <input
                      type="range"
                      className="custom-range"
                      id="speechRate"
                    />
                  </fieldset>
                </td>
                <td>
                  <p>Feedback Level</p>
                </td>
                <td>
                  <fieldset class="form-group">
                    <input
                      type="range"
                      className="custom-range"
                      id="feedbackLevel"
                    />
                  </fieldset>
                </td>
              </tr>
            </table>
            <h3>AI Personality</h3>
          </div>
        </div>
      </Fragment>
    );
  }
}
