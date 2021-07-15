import { API } from "aws-amplify";
import React, { useState, useContext } from "react";
import {
  Container,
  Row,
  Col,
  Button,
  Modal,
  Form,
  Alert,
} from "react-bootstrap";
import { Auth } from "aws-amplify";
import { UserContext } from "../contexts/UserContext";

export default function AccountManagement() {
  const userId = useContext(UserContext).userId;
  const [oldPassword, setOldPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [newPassword2, setNewPassword2] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [changingPassword, setChangingPassword] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");
  const [showError, setShowError] = useState(false);
  const [showAlert, setShowAlert] = useState(false);

  async function changePassword() {
    if (newPassword == newPassword2) {
      setChangingPassword(true);
      const currentUser = await Auth.currentAuthenticatedUser();
      try {
        await Auth.changePassword(currentUser, oldPassword, newPassword);
        setShowPassword(false);
        setShowAlert(true);
        window.setTimeout(() => {
          setShowAlert(false);
        }, 5000);
      } catch (error) {
        setErrorMessage(error.message);
        setShowError(true);
      }
      setChangingPassword(false);
    } else {
      setErrorMessage("Passwords don't match");
      setShowError(true);
    }
  }

  const getPortal = () => {
    API.post("talkbackBE", "/customer_portal?userId=" + userId).then((res) => {
      window.location.href = res;
    });
  };
  return (
    <>
      {showAlert ? (
        <Alert variant="success" dismissable={true}>
          Password successfully changed.
        </Alert>
      ) : null}
      <Container className="p-2">
        <Row className="p-3">
          <Col>Email:</Col>
          <Col>Blah</Col>
        </Row>
        <Row className="p-3">
          <Col>Password:</Col>
          <Col>
            <Button
              onClick={() => {
                setShowPassword(true);
                setShowError(false);
              }}
            >
              Change
            </Button>
          </Col>
        </Row>
        <Row className="p-3">
          <Col>Payment Details:</Col>
          <Col>
            <Button onClick={getPortal}>Update</Button>
          </Col>
        </Row>
        <Row className="p-3">
          <Col>Next Bill:</Col>
          <Col>Blah blah</Col>
        </Row>
      </Container>

      {showPassword ? (
        <Modal
          show={showPassword}
          onHide={() => {
            setShowPassword(false);
          }}
        >
          <Modal.Header closeButton>
            <Modal.Title>Change Password</Modal.Title>
          </Modal.Header>
          <Modal.Body>
            <Form>
              <Form.Group controlId="oldPassword">
                <Form.Label>Old Password</Form.Label>
                <Form.Control
                  type="password"
                  onChange={(e) => {
                    setOldPassword(e.target.value);
                  }}
                />
              </Form.Group>

              <Form.Group controlId="newPassowrd">
                <Form.Label>New Password</Form.Label>
                <Form.Control
                  type="password"
                  onChange={(e) => {
                    setNewPassword(e.target.value);
                  }}
                />
              </Form.Group>
              <Form.Group controlId="confirmNewPassowrd">
                <Form.Label>Confirm New Password</Form.Label>
                <Form.Control
                  type="password"
                  onChange={(e) => {
                    setNewPassword2(e.target.value);
                  }}
                />
              </Form.Group>
              {showError ? (
                <Form.Text className="text-danger">{errorMessage}</Form.Text>
              ) : null}
            </Form>
          </Modal.Body>
          <Modal.Footer>
            <Button
              variant="secondary"
              onClick={() => {
                setShowPassword(false);
              }}
            >
              Close
            </Button>
            <Button
              disabled={changingPassword}
              variant="primary"
              onClick={() => {
                changePassword();
              }}
            >
              {changingPassword ? "Changing" : "Change"}
            </Button>
          </Modal.Footer>
        </Modal>
      ) : null}
    </>
  );
}
