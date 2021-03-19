import React, { useState, useEffect } from "react";
import { openInPort, openOutPort } from "../services/midiService";
import { Container, Row, Col, Button, Form } from "react-bootstrap";
import { API } from "aws-amplify";

export default function Preferences({
  userId,
  midiInputs,
  midiOutputs,
  midiIn,
  midiOut,
  setMidiIn,
  setMidiOut,
}) {
  const [theme, setTheme] = useState("None");
  const [mag, setMag] = useState("None");

  const [isSaving, setIsSaving] = useState(false);

  const patchPrefs = () => {
    setIsSaving(true);
    const prefs = {
      theme: theme,
      mag: mag,
      midi_in: midiIn,
      midi_out: midiOut,
    };
    API.patch("talkbackBE", "/prefs?userId=" + userId, { body: prefs }).then(
      (res) => {
        setIsSaving(false);
        openInPort(midiIn);
        openOutPort(midiOut);
      }
    );
  };

  return (
    <Container className="p-2">
      <h1>Page Still Under Construction!!!</h1>
      <Row className="p-3">
        <h3>Look/Feel</h3>
      </Row>
      <Row className="p-3">
        <Col>Dark/Light</Col>
        <Col>
          <Button className="btn-sm w-25" disabled>
            Dark
          </Button>
        </Col>
        <Col>Magnifaction</Col>
        <Col>
          <Button className="btn-sm w-25" disabled>
            On
          </Button>
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
                setMidiIn(e.target.value);
              }}
              value={midiIn}
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
                setMidiOut(e.target.value);
              }}
              value={midiOut}
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

      {/* <Row className="p-3">
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
      </Row> */}
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
          <Form>
            <Form.Group controlId="speechRate">
              <Form.Control type="range" disabled />
            </Form.Group>
          </Form>
        </Col>
        <Col>Feedback Level</Col>

        <Col>
          <Form>
            <Form.Group controlId="feedBackLevel">
              <Form.Control type="range" disabled />
            </Form.Group>
          </Form>
        </Col>
      </Row>
      <Row className="p-3">
        <Col sm={2}>
          <Button onClick={!isSaving ? patchPrefs : null} disabled={isSaving}>
            {isSaving ? "Saving..." : "Save"}
          </Button>
        </Col>
      </Row>
    </Container>
  );
}
