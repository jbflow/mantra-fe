import React from "react";
import { Container, Table } from "react-bootstrap";

export default function Browser() {
  return (
    <Container>
      <Table bordered striped responsive="sm">
        <thead>
          <tr>
            <th>Instruments</th>
            <th>Audio Effects</th>
            <th>MIDI Effects</th>
            <th>VST's</th>
            <th>Samples</th>
          </tr>
        </thead>
        <tbody>
          <tr>
            <td>Table cell</td>
            <td>Table cell</td>
            <td>Table cell</td>
            <td>Table cell</td>
            <td>Table cell</td>
          </tr>
        </tbody>
      </Table>
    </Container>
  );
}
