import React from "react";
import { Container, Table } from "react-bootstrap";

export default function Clips({ sel_track, clips }) {
  return (
    <>
      <ul>
        <h5>Clips</h5>
        {clips[sel_track - 1]
          ? clips[sel_track - 1].map((clip, id) => <li key={id}>{clip}</li>)
          : null}
      </ul>
    </>
  );
}
