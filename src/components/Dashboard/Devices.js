import React, { Component } from "react";
import { Container, Table } from "react-bootstrap";

export default class Devices extends Component {
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
              <th>Track</th>
              {this.state.config.track.map((track) => (
                <th key={track}>{track}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            <tr>
              <td>Devices</td>
              {this.state.config.device.map((device) => (
                <td>
                  <ul>
                    {device.map((device) => (
                      <li>{device}</li>
                    ))}
                  </ul>
                </td>
              ))}
            </tr>
          </tbody>
        </Table>
      </Container>
    );
  }
}
