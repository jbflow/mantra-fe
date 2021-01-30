import React, { Component, Fragment } from "react";
import { setInPort, setOutPort } from "../services/midiService";
import {
  Container,
  Row,
  Col,
  Button,
  DropdownButton,
  InputGroup,
} from "react-bootstrap";
// import "../styles/App.scss";

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
      <Container fluid className="p-2">
        <Row className="p-3">
          <h3>Look/Feel</h3>
        </Row>
        <Row className="p-3">
          <Col>Dark/Light</Col>
          <Col>
            <Button className="btn-sm w-25">Dark</Button>
          </Col>
          <Col>Magnifaction</Col>
          <Col>
            <Button className="btn-sm w-25">On</Button>
          </Col>
        </Row>

        <Row className="p-3">
          <h3>Ins/Outs</h3>
        </Row>
        <Row className="p-3">
          <Col>MIDI</Col>
          <Col>
            <DropdownButton
              id="midiIn"
              title="MIDI In"
              onChange={this.midiOutChanged}
            >
              {this.state.midiInputs.map((input) => (
                <DropdownButton.item key="MidiIn">{input}</DropdownButton.item>
              ))}
            </DropdownButton>
          </Col>

          <Col>
            <DropdownButton
              id="midiOut"
              title="MIDI Out"
              onChange={this.midiOutChanged}
            >
              {this.state.midiOutputs.map((output) => (
                <DropdownButton.item key="MidiOut">
                  {output}
                </DropdownButton.item>
              ))}
            </DropdownButton>
          </Col>
        </Row>

        <Row className="p-3">
          <Col>Audio</Col>

          <Col>
            <DropdownButton id="audioIn" title="Audio In">
              {this.state.audioInputs.map((input) => (
                <DropdownButton.item key="AudioIn">{input}</DropdownButton.item>
              ))}
            </DropdownButton>
          </Col>

          <Col>
            <DropdownButton id="audioOut" title="Audio Out">
              {this.state.audioOutputs.map((output) => (
                <DropdownButton.item key="AudioOut">
                  {output}
                </DropdownButton.item>
              ))}
            </DropdownButton>
          </Col>
        </Row>
        <Row className="p-3">
          <h3>Intent Engine</h3>
        </Row>
        <Row className="p-3">
          <Col>Increment Default</Col>
          <Col></Col>
          <Col>Decrement Default</Col>
          <Col></Col>
        </Row>

        <Row className="p-3">
          <Col>Track Default</Col>
          <Col></Col>
          <Col>Device Default</Col>
          <Col></Col>
        </Row>
        <Row className="p-3">
          <Col>Priority Hierachy</Col>
          <Col></Col>
          <Col></Col>
          <Col></Col>
        </Row>
        <Row className="p-3">
          <h3>Speech</h3>
        </Row>

        <Row className="p-3">
          <Col>Speech Rate</Col>

          <Col>
            <fieldset className="form-group">
              <input type="range" className="custom-range" id="speechRate" />
            </fieldset>
          </Col>
          <Col>Feedback Level</Col>

          <Col>
            <fieldset className="form-group">
              <input type="range" className="custom-range" id="feedbackLevel" />
            </fieldset>
          </Col>
        </Row>
        <Row className="p-3">
          <h3>AI Personality</h3>
        </Row>
      </Container>
    );
  }
}
