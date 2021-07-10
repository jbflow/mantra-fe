import React from "react";
import { Container, Table } from "react-bootstrap";

export default function Parameters({ sel_track, sel_device, parameters }) {
  return (
    <>
      <ul>
        <h5>Parameters</h5>
        {parameters[sel_track - 1]
          ? parameters[sel_track - 1][sel_device - 1]
            ? parameters[sel_track - 1][sel_device - 1].map((parameter, id) => (
                <li key={id}>{parameter}</li>
              ))
            : null
          : null}
      </ul>
    </>
  );
}
