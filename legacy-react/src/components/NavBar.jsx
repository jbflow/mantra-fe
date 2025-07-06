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
        style={{ ...styles.forceColumn }}
        className="mainbar"
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
               Macros (Beta)
              <img
                style={{ ...styles.icon, width: "22px" }}
                alt="Command Builder nav logo"
                src="./images/menu-icons/command.svg"
              />
            </Link>

          </Nav>
        </Navbar.Collapse>
      </Navbar>
    </div>
  );
}
