import React from "react";
import { Link } from "react-router-dom";
import { Navbar, Nav } from "react-bootstrap";
import "./NavBar.css";

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

export default function NavBar({ signOut }) {
  return (
    <div>
      <Navbar
        variant="dark"
        expand="lg"
        style={{ ...styles.forceColumn, ...styles.mainbar }}
      >
        <Navbar.Toggle aria-controls="navigation" />
        <Navbar.Collapse id="navigation" style={styles.forceColumn}>
          <Nav className="mr-auto" style={styles.forceColumn}>
            <Link className="nav-link nav-link-sidebar" to="/voice-control">
              Voice Control
              <img
                style={{ ...styles.icon, width: "35px", paddingLeft: "11px" }}
                alt="Command Builder nav logo"
                src="./images/menu-icons/mic-fill.svg"
              />
            </Link>
            <Link className="nav-link nav-link-sidebar" to="/commands">
              Build Macros
              <img
                style={{...styles.icon, width: "22px"}}
                alt="Command Builder nav logo"
                src="./images/menu-icons/command.svg"
              />
            </Link>
            <Link className="nav-link nav-link-sidebar" to="/account">
              Preferences
              <img
                style={{...styles.icon, width: "24px"}}
                alt="Testing Area nav logo"
                src="./images/menu-icons/gear-wide-connected.svg"
              />
            </Link>

            <Link className="nav-link nav-link-sidebar" to="/help-and-support">
              Help & Support
              <img
                style={{ ...styles.icon, width: "23px", filter: "invert(100%) sepia(0%) saturate(0%) hue-rotate(108deg) brightness(110%) contrast(101%)" }}
                alt="Command Builder nav logo"
                src="./images/menu-icons/question.svg"
              />
            </Link>

          </Nav>
        </Navbar.Collapse>
      </Navbar>
    </div>
  );
}
