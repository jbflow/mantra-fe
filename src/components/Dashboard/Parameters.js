import React, { Component } from "react";
import { Container, Table } from "react-bootstrap";

export default class Parameters extends Component {
  constructor(props) {
    super(props);
    console.log(props);
    this.state = { config: this.props.config };
  }
  render() {
    return (
      <Container>
        {this.state.config.track.map((track, index) => (
          <Table key={track} bordered striped responsive="sm">
            <thead>
              <tr>
                <th>{track}</th>
                {this.state.config.device[index].map((device, index) => (
                  <th key={device}>{device}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              <tr>
                <td>Parameters</td>
                {this.state.config.parameter[index].map((param, index) => (
                  <td key={param}>
                    {param.map((p) => (
                      <ul key={p}>
                        <li>{p}</li>
                      </ul>
                    ))}
                  </td>
                ))}
              </tr>
            </tbody>
          </Table>
        ))}
      </Container>
    );
  }
}
