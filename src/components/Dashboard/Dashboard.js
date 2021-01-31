import React, { Component } from "react";
import { Container, Tabs, Tab } from "react-bootstrap";
import General from "./General";
import Tracks from "./Tracks";
import Devices from "./Devices";
import Clips from "./Clips";
import Parameters from "./Parameters";
import Browser from "./Browser";

export default class Dashboard extends Component {
  constructor() {
    super();
    this.state = {
      tabArray: [
        "General",
        "Tracks",
        "Devices",
        "Clips",
        "Parameters",
        "Browser",
      ],
      tabComponents: [
        <General />,
        <Tracks />,
        <Devices />,
        <Clips />,
        <Parameters />,
        <Browser />,
      ],
    };
  }
  render() {
    return (
      <Container>
        <Tabs defaultActiveKey="Tracks" id="uncontrolled-tab-example">
          {this.state.tabArray.map((tab, index) => (
            <Tab key={tab} eventKey={tab} title={tab}>
              {this.state.tabComponents[index]}
            </Tab>
          ))}
        </Tabs>
      </Container>
    );
  }
}
