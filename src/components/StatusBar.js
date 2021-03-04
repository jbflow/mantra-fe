import React, { useEffect, useState } from "react";
import { Container, Row, Col, Badge } from "react-bootstrap";

export let updateMicConnected;
export let updateScriptConnected;
export let updateIsListening;
export let updateTranscript;

export default function StatusBar({ midiIn, midiOut }) {
  console.log(midiIn);
  const [micConnected, setMicConnected] = useState(false);
  const [scriptConnected, setScriptConnected] = useState(false);
  const [isListening, setIsListening] = useState(false);
  const [transcript, setTranscript] = useState("");

  useEffect(() => {
    updateMicConnected = setMicConnected;
    updateScriptConnected = setScriptConnected;
    updateIsListening = setIsListening;
    updateTranscript = setTranscript;
  }, []);

  return (
    <div className="fixed-bottom">
      <Container fluid className="bg-dark text-light">
        <Row>
          <Col sm={2}>
            Mic
            <Badge
              className="m-3"
              variant={micConnected ? "success" : "danger"}
            >
              {micConnected ? "Allowed" : "Not Allowed"}
            </Badge>
          </Col>
          <Col sm={2}>
            Script
            <Badge
              className="m-3"
              variant={scriptConnected ? "success" : "danger"}
            >
              {scriptConnected ? "Connected" : "Not Connected"}
            </Badge>
          </Col>
          <Col sm={2}>
            MIDI In
            <Badge className="m-3" variant="light">
              {midiIn}
            </Badge>
          </Col>
          <Col sm={2}>
            MIDI Out
            <Badge className="m-3" variant="light">
              {midiOut}
            </Badge>
          </Col>
          <Col sm={2}>
            TlkBck
            <Badge className="m-3" variant={isListening ? "success" : "light"}>
              {isListening ? "Listening" : "Not Listening"}
            </Badge>
          </Col>
        </Row>
        <Row>
          <Col>
            {"Transcript:  "}
            {transcript}
          </Col>
        </Row>
      </Container>
    </div>
  );
}
