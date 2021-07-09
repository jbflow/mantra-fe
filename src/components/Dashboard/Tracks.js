import React from "react";
import { Container, Table } from "react-bootstrap";

export default function Tracks({ tracks }) {
  return (
    <Container>
      <ul>
        <h5>Tracks</h5>
        {tracks ? tracks.map((track, id) => <li key={id}>{track}</li>) : null}
      </ul>
    </Container>
  );
}
