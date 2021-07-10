import React from "react";
import { Container, Row, Col } from "react-bootstrap";

export default function Browser({ instruments, audio_effects, midi_effects }) {
  return (
    <>
      <Row>
        <Col>
          <h5>Instruments</h5>
          <ul>
            {instruments
              ? instruments.map((instrument, id) => (
                  <li key={id}>{instrument}</li>
                ))
              : null}
          </ul>
        </Col>
        <Col>
          <h5>Audio Effects</h5>
          <ul>
            {audio_effects
              ? audio_effects.map((audio_effect, id) => (
                  <li key={id}>{audio_effect}</li>
                ))
              : null}
          </ul>
        </Col>
        <Col>
          <h5>MIDI Effects</h5>
          <ul>
            {midi_effects
              ? midi_effects.map((midi_effect, id) => (
                  <li key={id}>{midi_effect}</li>
                ))
              : null}
          </ul>
        </Col>
      </Row>
    </>
  );
}
