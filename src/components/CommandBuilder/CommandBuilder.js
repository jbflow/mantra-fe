import React, { useState, useContext } from "react";
import Commands from "./Commands";
import Actions from "./Actions";
import { Container, Row, Col } from "react-bootstrap";
import { UserContext } from "../contexts/UserContext";
import { CommandsContext } from "../../contexts/CommandsContext";

export default function CommandBuilder() {
  const userId = useContext(UserContext).userId;
  const [selected, setSelected] = useState(null);
  const updateSelected = (command) => {
    setSelected(command);
  };

  return (
    <Container fluid className="modal-open">
      <Row>
        <Col
          className="border-right"
          style={{
            backgroundColor: "#FFFFFF",
            padding: 0,
            height: "calc(100vh - 100px)",
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
