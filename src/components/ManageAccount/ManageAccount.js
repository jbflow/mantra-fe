import React from "react";
import { Container, Row, Col, Button } from "react-bootstrap";

export default function ManageAccount() {
  return (
    <Container>
      <Row>
        <Col>Email:</Col>
        <Col>
          <Button>Change</Button>
        </Col>
      </Row>

      <Row>
        <Col>Password</Col>
        <Col>
          <Button>Change</Button>
        </Col>
      </Row>

      <Row>
        <Col>Billing</Col>
        <Col>
          <Button>update</Button>
        </Col>
      </Row>
    </Container>
  );
}
