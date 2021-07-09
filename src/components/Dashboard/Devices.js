import React from "react";
import { Container, Table } from "react-bootstrap";

export default function Devices({ sel_track, devices }) {
  console.log(devices);
  console.log(sel_track);
  return (
    <Container>
      <ul>
        <h5>Devices</h5>
        {devices[sel_track || 0]
          ? devices[sel_track || 0].map((device, id) => (
              <li key={id}>{device}</li>
            ))
          : null}
      </ul>
    </Container>
  );
}
