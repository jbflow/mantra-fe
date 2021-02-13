import React from "react";
import { Container, Tabs, Tab } from "react-bootstrap";
import General from "./General";
import Tracks from "./Tracks";
import Devices from "./Devices";
import Clips from "./Clips";
import Parameters from "./Parameters";
import Browser from "./Browser";
const tabArray = [
  "General",
  "Tracks",
  "Devices",
  "Clips",
  "Parameters",
  "Browser",
]

const tabComponents = [
  <General />,
  <Tracks />,
  <Devices />,
  <Clips />,
  <Parameters />,
  <Browser />,
]

export default function Dashboard() {
  return (
    <Container>
      <Tabs defaultActiveKey="Tracks" id="uncontrolled-tab-example">
        {tabArray.map((tab, index) => (
          <Tab key={tab} eventKey={tab} title={tab}>
            {tabComponents[index]}
          </Tab>
        ))}
      </Tabs>
    </Container>
  );
}
