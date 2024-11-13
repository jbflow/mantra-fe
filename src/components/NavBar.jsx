import React from "react";
import { Link } from "react-router-dom";
import { Navbar, Nav } from "react-bootstrap";
import "../styles/Navbar.css";
import VoiceControl from "./VoiceControl/VoiceControl";

const styles = {
  mainbar: {
    backgroundColor: "#6C757D",
  },
  forceColumn: {
    width: "210px",
    height: "100%",
    flexFlow: "column",
    alignItems: "initial",
    position: "fixed",
    paddingTop: 20,
    paddingRight: 10,
  },
  icon: {
    float: "right",
  },
};

export default function NavBar({ signOut, setAlternatives, transcript, confirmation, setConfirmation, speak, speaking, actions, runningWorkflow}) {
  return (
    <div>
      <Navbar
        variant="dark"
        expand="lg"
        style={{ ...styles.forceColumn }}
        className="mainbar"
      >
        <Navbar.Toggle aria-controls="navigation" />
        <Navbar.Collapse id="navigation" style={styles.forceColumn}>
          <Nav className="mr-auto" style={styles.forceColumn}>
            {/* Put navigation stuff here later if needed */}

            <VoiceControl setAlternatives={setAlternatives} transcript={transcript} confirmation={confirmation} setConfirmation={setConfirmation} speak={speak} speaking={speaking} actions={actions} runningWorkflow={runningWorkflow}/>
          </Nav>
        </Navbar.Collapse>
      </Navbar>
    </div>
  );
}
