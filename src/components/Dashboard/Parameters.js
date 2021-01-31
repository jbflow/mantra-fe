import React, { Component } from "react";
import { Container, Table } from "react-bootstrap";

export default class Parameters extends Component {
  render() {
    return (
      <Container>
        <Table bordered striped responsive="sm">
          <thead>
            <tr>
              <th>Device</th>
              <th>Table heading</th>
              <th>Table heading</th>
              <th>Table heading</th>
              <th>Table heading</th>
              <th>Table heading</th>
              <th>Table heading</th>
            </tr>
          </thead>
          <tbody>
            <tr>
              <td>Parameters</td>
              <td>Table cell</td>
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
}
