import React, { useEffect, useState } from "react";
import { Container, Row, Col, Badge } from "react-bootstrap";

export let updateMicConnected;
export let updateScriptConnected;

export default function StatusBar() {
  const [micConnected, setMicConnected] = useState(false);
  const [scriptConnected, setScriptConnected] = useState(false);

  useEffect(() => {
    updateMicConnected = setMicConnected;
    updateScriptConnected = setScriptConnected;
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
            <Badge variant="success">Port Name</Badge>
          </Col>
          <Col>
            MIDI Out
            <Badge variant="success">Port Name</Badge>
          </Col>
          <Col>
            TlkBck
            <Badge variant="success">Listening</Badge>
          </Col>
        </Row>
        <Row>
          <Col>Transcript</Col>
        </Row>
      </Container>
    </div>
  );
}
