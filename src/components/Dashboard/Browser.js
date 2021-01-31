import React, { Component } from "react";
import { Container, Table } from "react-bootstrap";

export default class Browesr extends Component {
  constructor(props) {
    super(props);
    this.state = { config: this.props.config };
  }
  render() {
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
              <td>
                {this.state.config.instrument.map((instrument) => (
                  <ul key={instrument}>
                    <li>{instrument}</li>
                  </ul>
                ))}
              </td>

              <td>
                {this.state.config.audio_device.map((audio) => (
                  <ul key={audio}>
                    <li>{audio}</li>
                  </ul>
                ))}
              </td>

              <td>
                {this.state.config.midi_device.map((midi) => (
                  <ul key={midi}>
                    <li>{midi}</li>
                  </ul>
                ))}
              </td>

              <td>VST List</td>
              <td>Sample List</td>
            </tr>
          </tbody>
        </Table>
      </Container>
    );
  }
}
