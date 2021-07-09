import React, { useState, useEffect } from "react";
import { Container, Row, Col } from "react-bootstrap";
import General from "./General";
import Tracks from "./Tracks";
import Devices from "./Devices";
import Clips from "./Clips";
import Parameters from "./Parameters";
import Browser from "./Browser";

export default function Dashboard({ config }) {
  return (
    <Container className="h-100">
      <Row>
        <Col>
          <Tracks tracks={config ? config.track : null} />
        </Col>
        <Col>
          <Devices
            sel_track={config ? config.sel_track : null}
            devices={config ? config.device : null}
          />
        </Col>
      </Row>
    </Container>
  );
}
