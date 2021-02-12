import React, { useState } from "react";
import Commands from "./Commands";
import Actions from "./Actions";
import { Container, Row, Col } from "react-bootstrap";

export default function CommandBuilder() {
  const [selected, setSelected] = useState(null);
  const updateSelected = (command) => {
    setSelected({ selected: command });
  };

  return (
    <Container fluid>
      <Row>
        <Col
          sm={3}
          className="border-right border-secondary vh-100"
          style={{
            backgroundColor: "#e9ecef",
          }}
        >
          <Commands updateSelected={updateSelected} />
        </Col>

        <Col sm={9}>
          <Actions selected={selected} />
        </Col>
      </Row>
    </Container>
  );
}
