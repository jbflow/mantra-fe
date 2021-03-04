import React, { useState, useEffect } from "react";
import { Container, Tabs, Tab } from "react-bootstrap";
import General from "./General";
import Tracks from "./Tracks";
import Devices from "./Devices";
import Clips from "./Clips";
import Parameters from "./Parameters";
import Browser from "./Browser";
export let updateConfig;

const tabArray = [
  "General",
  "Tracks",
  "Devices",
  "Clips",
  "Parameters",
  "Browser",
];

export default function Dashboard() {
  const [config, setConfig] = useState(null);

  useEffect(() => {
    updateConfig = setConfig;
    return () => {
      updateConfig = null;
    };
  });

  const tabComponents = [
    <General config={config} />,
    <Tracks config={config} />,
    <Devices config={config} />,
    <Clips config={config} />,
    <Parameters config={config} />,
    <Browser config={config} />,
  ];

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
