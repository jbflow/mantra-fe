import { API } from "aws-amplify";
import React from "react";
import { Container, Row, Col, Button } from "react-bootstrap";

export default function AccountManagement({ userId }) {
  const getPortal = () => {
    API.post("talkbackBE", "/customer_portal?userId=" + userId).then((res) => {
      window.location.href = res;
    });
  };
  return (
    <Container>
      <Row>
        <Col>Email:</Col>
        <Col>Blah</Col>
      </Row>
      <Row>
        <Col>Password:</Col>
        <Col>Blah blah</Col>
      </Row>
      <Row>
        <Col>Payment Details:</Col>
        <Col>
          <Button onClick={getPortal}>Update</Button>
        </Col>
      </Row>
      <Row>
        <Col>Next Bill:</Col>
        <Col>Blah blah</Col>
      </Row>
    </Container>
  );
}
