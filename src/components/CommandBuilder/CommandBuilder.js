import React, { Component } from "react";
import Commands from "./Commands";
import Actions from "./Actions";
import { Container, Row, Col } from "react-bootstrap";

export default class CommandBuilder extends Component {
  constructor(props) {
    super(props);
    // const { ws, getConfig } = props;
    this.state = { selected: null };
  }

  updateSelected = (command) => {
    this.setState({ selected: command });
  };

  render() {
    return (
      <Container fluid>
        <Row>
          <Col
            sm={3}
            className="border-right border-secondary vh-100"
            style={{
              backgroundColor: "#e9ecef",
            }}
          >
            <Commands updateSelected={this.updateSelected} userid={this.props.userid} />
          </Col>

          <Col sm={9}>
            <Actions selected={this.state.selected} />
          </Col>
        </Row>
      </Container>
    );
  }
}
