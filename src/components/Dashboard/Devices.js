import React from "react";
import { Container, Table } from "react-bootstrap";

export default function Devices({ sel_track, devices }) {
  return (
    <>
      <ul>
        <h5>Devices</h5>
        {devices[sel_track - 1]
          ? devices[sel_track - 1].map((device, id) => (
              <li key={id}>{device}</li>
            ))
          : null}
      </ul>
    </>
  );
}
