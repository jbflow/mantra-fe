import React, { Component } from "react";
import { Container, Table } from "react-bootstrap";

export default class General extends Component {
  render() {
    return (
      <Container>
        <Table bordered striped responsive="sm">
          <thead>
            <tr>
              <th>Attribute</th>
              <th>Value</th>
            </tr>
          </thead>
          <tbody>
            <tr>
              <td>Open Daw</td>
              <td>Ableton Live</td>
            </tr>
            <tr>
              <td>Last Command</td>
              <td>Load Compressor on to Track 1</td>
            </tr>
            <tr>
              <td>Selected Track</td>
              <td>11</td>
            </tr>
            <tr>
              <td>Selected Device</td>
              <td>2</td>
            </tr>
            <tr>
              <td># Tracks</td>
              <td>35</td>
            </tr>
            <tr>
              <td># Devices</td>
              <td>135</td>
            </tr>
            <tr>
              <td># Clips</td>
              <td>240</td>
            </tr>
            <tr>
              <td># Notes</td>
              <td>1618</td>
            </tr>
            <tr>
              <td>Most frequently used device</td>
              <td>Compressor</td>
            </tr>
            <tr>
              <td>Etc</td>
              <td>Etc</td>
            </tr>
          </tbody>
        </Table>
      </Container>
    );
  }
}
