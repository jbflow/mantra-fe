import React, { useState, useEffect } from "react";
import { Container, Row, Col } from "react-bootstrap";

import "./Dashboard.css";
import General from "./General";
import Tracks from "./Tracks";
import Devices from "./Devices";
import Clips from "./Clips";
import Parameters from "./Parameters";
import Browser from "./Browser";

export default function Dashboard({ config, totalTime, totalCommands }) {
  return (
    <Container>
      <Row>
        <General totalTime={totalTime} totalCommands={totalCommands} />
      </Row>
      <Row>
        <Tracks tracks={config ? config.track : null} />

        <Devices
          sel_track={config ? config.sel_track : null}
          devices={config ? config.device : null}
        />

        <Clips
          sel_track={config ? config.sel_track : null}
          clips={config ? config.clip : null}
        />

        <Parameters
          sel_track={config ? config.sel_track : null}
          sel_device={config ? config.sel_device : null}
          parameters={config ? config.parameter : null}
        />
      </Row>
      <Row>
        <Browser
          instruments={config ? config.instrument : null}
          audio_effects={config ? config.audio_device : null}
          midi_effects={config ? config.midi_device : null}
        />
      </Row>
    </Container>
  );
}
