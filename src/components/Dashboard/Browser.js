import React from "react";
import { Container, Row, Col } from "react-bootstrap";

export default function Browser({ instruments, audio_effects, midi_effects }) {
  return (
    <>
      <div className="mt-3 mb-5 dashboard-card db-lg">
        <div className="dashboard-card-title">
          <p className="dashboard-contents m-2">Instruments </p>
        </div>
        {instruments
          ? instruments.map((instrument, id) => (
              <p className="dashboard-contents m-2" key={id}>
                {instrument}
              </p>
            ))
          : null}
      </div>

      <div className="mt-3 mb-5 dashboard-card db-lg">
        <div className="dashboard-card-title">
          <p className="dashboard-contents m-2">Audio Effects</p>
        </div>
        {audio_effects
          ? audio_effects.map((audio_effect, id) => (
              <p className="dashboard-contents m-2" key={id}>
                {audio_effect}
              </p>
            ))
          : null}
      </div>

      <div className="mt-3 mb-5 dashboard-card db-lg">
        <div className="dashboard-card-title">
          <p className="dashboard-contents m-2">MIDI Effects </p>
        </div>
        {midi_effects
          ? midi_effects.map((midi_effect, id) => (
              <p className="dashboard-contents m-2" key={id}>
                {midi_effect}
              </p>
            ))
          : null}
      </div>
    </>
  );
}
