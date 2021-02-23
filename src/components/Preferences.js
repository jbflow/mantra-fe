import React, { useState, useEffect } from "react";
import { setInPort, setOutPort } from "../services/midiService";
import {
  Container,
  Row,
  Col,
  Button,
  Form,
  Dropdown,
  DropdownButton,
} from "react-bootstrap";

export let updateMidiInputs;
export let updateMidiOutputs;

export default function Preferences() {
  const [midiInputs, setMidiInputs] = useState([]);
  const [midiOutputs, setMidiOutputs] = useState([]);
  const [audioInputs, setAudioInputs] = useState([]);
  const [audioOutputs, setAudioOutputs] = useState([]);

  useEffect(() => {
    updateMidiInputs = setMidiInputs;
    updateMidiOutputs = setMidiOutputs;

    return () => {
      updateMidiInputs = null;
      updateMidiOutputs = null;
    };
  });

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
          <Form>
            <Form.Label className="p-1">Input</Form.Label>
            <Form.Control
              as="select"
              onChange={(e) => {
                setInPort(e.target.value);
              }}
            >
              <option>Choose...</option>
              {midiInputs.map((input) => (
                <option as="button" key={input.id}>
                  {input.name}
                </option>
              ))}
            </Form.Control>
          </Form>
        </Col>

        <Col>
          <Form>
            <Form.Label className="p-1">Output</Form.Label>
            <Form.Control
              as="select"
              onChange={(e) => {
                setOutPort(e.target.value);
              }}
            >
              <option>Choose...</option>
              {midiOutputs.map((output) => (
                <option as="button" key={output.id}>
                  {output.name}
                </option>
              ))}
            </Form.Control>
          </Form>
        </Col>
      </Row>

      <Row className="p-3">
        <Col>Audio</Col>

        <Col>
          <DropdownButton id="audioIn" title="Audio In">
            {audioInputs.map((input) => (
              <Dropdown.Item key="audioIn">{input}</Dropdown.Item>
            ))}
          </DropdownButton>
        </Col>

        <Col>
          <DropdownButton id="audioOut" title="Audio Out">
            {audioOutputs.map((output) => (
              <Dropdown.Item key="audioOut">{output}</Dropdown.Item>
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
