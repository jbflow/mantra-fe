import React, { useState } from "react";
import Commands from "./Commands";
import Actions from "./Actions";
import { Container, Row, Col } from "react-bootstrap";

export default function CommandBuilder({ userId }) {
  const [selected, setSelected] = useState(null);
  const updateSelected = (command) => {
    setSelected(command);
  };

  return (
    <Container fluid>
      <Row>
        <Col
          sm={3}
          className="border-right border-secondary vh-87"
          style={{
            backgroundColor: "#e9ecef",
          }}
        >
          <Commands updateSelected={updateSelected} userId={userId} />
        </Col>

        <Col sm={9}>
          <Actions selected={selected} userId={userId} />
        </Col>
      </Row>
    </Container>
  );
}
