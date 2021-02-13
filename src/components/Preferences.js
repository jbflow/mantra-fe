import React, { useState } from "react";
import { setInPort, setOutPort } from "../services/midiService";
import { Container, Row, Col, Button, DropdownButton } from "react-bootstrap";

export default function Preferences() {

  const [midiInputs, setMidiInputs] = useState([]);
  const [midiOutputs, setMidiOutputs] = useState([]);
  const [audioInputs, setAudioInputs] = useState([]);
  const [audioOutputs, setAudioOutputs] = useState([]);

  const setMidiPorts = (inputs, outputs) => {
    inputs.forEach((input) => {
      setMidiInputs([...midiInputs, input.name]);
    });
    outputs.forEach((output) => {
      setMidiOutputs([...midiOutputs, output.name]);
    });
  };

  const midiOutChanged = (e) => {
    setOutPort(e.target.value); // set the selected port inside the midiservice, need to handle opening and closing
  };

  const midiInChanged = (e) => {
    setInPort(e.target.value);
  };

  return (
    <Container className="p-2">
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
            onChange={midiOutChanged}
          >
            {midiInputs.map((input) => (
              <DropdownButton.Item key="midiIn">{input}</DropdownButton.Item>
            ))}
          </DropdownButton>
        </Col>

        <Col>
          <DropdownButton
            id="midiOut"
            title="MIDI Out"
            onChange={midiOutChanged}
          >
            {midiOutputs.map((output) => (
              <DropdownButton.Item key="midiOut">
                {output}
              </DropdownButton.Item>
            ))}
          </DropdownButton>
        </Col>
      </Row>

      <Row className="p-3">
        <Col>Audio</Col>

        <Col>
          <DropdownButton id="audioIn" title="Audio In">
            {audioInputs.map((input) => (
              <DropdownButton.Item key="audioIn">{input}</DropdownButton.Item>
            ))}
          </DropdownButton>
        </Col>

        <Col>
          <DropdownButton id="audioOut" title="Audio Out">
            {audioOutputs.map((output) => (
              <DropdownButton.Item key="audioOut">
                {output}
              </DropdownButton.Item>
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
