import React from "react";
import { Link } from "react-router-dom";
import { Navbar, Nav, Form, Button } from "react-bootstrap";
import { FaCog } from "react-icons/fa";
import { IconContext } from "react-icons";
import './NavBar.css';

const styles = {
  mainbar: {
    backgroundColor: '#6C757D'
  },
  forceColumn: {
    width: '288px',
    height: '100vh',
    flexFlow: 'column',
    alignItems: 'initial',
  }
}

export default function NavBar({ signOut }) {
  return (
    <Navbar variant="dark" expand="lg" style={{ ...styles.forceColumn, ...styles.mainbar }}>
      {/* <Navbar.Brand>TLKBCK</Navbar.Brand> */}
      <Navbar.Toggle aria-controls="navigation" />
      <Navbar.Collapse
        id="navigation"
        style={styles.forceColumn}
      >
        <Nav
          className="mr-auto"
          style={styles.forceColumn}>
          <Link className="nav-link nav-link-sidebar" to="/dashboard" >
            Dashboard
          </Link>
          <Link className="nav-link nav-link-sidebar" to="/commands">
            Command Builder
          </Link>
          <Link className="nav-link nav-link-sidebar" to="/beta">
            Testing Area
          </Link>
        </Nav>
        <IconContext.Provider
          value={{
            style: {
              fontSize: "20px",
              cursor: "pointer",
            },
          }}
        >
          <Link to="/prefs">
            <FaCog className="mr-sm-3" color="white" />
          </Link>
        </IconContext.Provider>
        <Form inline>
          <Button variant="outline-light" onClick={signOut}>
            Sign Out
          </Button>
        </Form>
      </Navbar.Collapse>
    </Navbar>
  );
}
