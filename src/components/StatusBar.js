import React, { useEffect, useState } from "react";
import { Container, Row, Col, Badge } from "react-bootstrap";

export let updateMicConnected;
export let updateScriptConnected;
export let updateIsListening;

export default function StatusBar({ midiIn, midiOut }) {
  console.log(midiIn);
  const [micConnected, setMicConnected] = useState(false);
  const [scriptConnected, setScriptConnected] = useState(false);
  const [isListening, setIsListening] = useState(false);

  useEffect(() => {
    updateMicConnected = setMicConnected;
    updateScriptConnected = setScriptConnected;
    updateIsListening = setIsListening;
  }, []);

  return (
    <div className="fixed-bottom">
      <Container fluid className="bg-dark text-light">
        <Row>
          <Col>
            Mic
            <Badge variant={micConnected ? "success" : "danger"}>
              {micConnected ? "Allowed" : "Not Allowed"}
            </Badge>
          </Col>
          <Col>
            Script
            <Badge variant={scriptConnected ? "success" : "danger"}>
              {scriptConnected ? "Connected" : "Not Connected"}
            </Badge>
          </Col>
          <Col>
            MIDI In
            <Badge variant="info">{midiIn}</Badge>
          </Col>
          <Col>
            MIDI Out
            <Badge variant="info">{midiOut}</Badge>
          </Col>
          <Col>
            TlkBck
            <Badge variant={isListening ? "success" : "info"}>
              {isListening ? "Listening" : "Not Listening"}
            </Badge>
          </Col>
        </Row>
        <Row>
          <Col>Transcript</Col>
        </Row>
      </Container>
    </div>
  );
}
