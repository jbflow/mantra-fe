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


/**
 * The configuration page for the MIDI options used by tlkbck:
 * 
 * - Port number for input and output
 */
export default function MidiConfiguration() {
    const [inputPort, setInputPort] = useState("");
    const [outputPort, setOutputPort] = useState("");
    const [wakeWordCC, setWakeWordCC] = useState("");

    const changingMidiPorts = outputPort || inputPort || wakeWordCC;

    const saveMidiPort = () => {
        // Saves the MIDI port to the local storage using hook and also to dynamoDB

    }

    return (<>
        <Container className="p-2">
            {/* MIDI Input port */}

            <Form>
                <Form.Group controlId="inputPort">
                <Row className="p-3">
                    <Col>
                    <Form.Label>Input Port</Form.Label></Col>
                    <Col>
                    <Form.Control
                        type="number"
                        onChange={(e) => {
                            setInputPort(e.target.value)
                        }}></Form.Control>
                        </Col>
                        </Row>
                </Form.Group>

                <Form.Group controlId="outputPort">
                    <Row className="p-3">
                        <Col>
                    <Form.Label>Output Port</Form.Label></Col>
                    <Col><Form.Control
                        type="number"
                        onChange={(e) => {
                            setOutputPort(e.target.value)
                        }}></Form.Control>
                        </Col>
                        </Row>
                </Form.Group>

                <Form.Group controlId="wakeWordCC">
                    <Row className="p-3">
                        <Col>
                    <Form.Label>Wake Word MIDI CC</Form.Label></Col>
                    <Col><Form.Control
                        type="number"
                        onChange={(e) => {
                            setWakeWordCC(e.target.value)
                        }}></Form.Control>
                        </Col>
                        </Row>
                </Form.Group>


            </Form>

            <Button
                  disabled={changingMidiPorts}
                  variant="primary"
                  onClick={() => {
                    saveMidiPort();
                  }}>
                Save
                </Button>
        </Container>
    </>)

}