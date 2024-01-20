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
    marginTop: 4,
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
            <Link className="nav-link nav-link-sidebar" to="/commands">
              Command Builder
              <img
                style={styles.icon}
                alt="Command Builder nav logo"
                src="./images/menu-icons/command.svg"
              />
            </Link>
            <Link className="nav-link nav-link-sidebar" to="/account">
              Manage Account
              <img
                style={styles.icon}
                alt="Testing Area nav logo"
                src="./images/menu-icons/gear-wide-connected.svg"
              />
            </Link>

            <Link className="nav-link nav-link-sidebar" to="/testing">
              Testing
            </Link>
          </Nav>
        </Navbar.Collapse>
      </Navbar>
    </div>
  );
}
