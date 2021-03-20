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
    <Container fluid className="modal-open">
      <Row>
        <Col
          className="border-right vh-87"
          style={{
            backgroundColor: "#FFFFFF",
            padding: 0,
          }}
        >
          <Commands updateSelected={updateSelected} userId={userId} />
        </Col>

        <Col sm={9}>
          <Actions selected={selected} userId={userId} />
        </Col>
      </Row>
    </Container >
  );
}
