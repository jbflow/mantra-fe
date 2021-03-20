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
    width: '200px',
    height: '100vh',
    flexFlow: 'column',
    alignItems: 'initial',
  },
  icon: {
    float: 'right',
    marginTop: 4
  }
}

export default function NavBar({ signOut }) {
  return (
    <Navbar variant="dark" expand="lg" style={{ ...styles.forceColumn, ...styles.mainbar }}>
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
            <img style={styles.icon} alt='Dashboard nav logo' src='./images/menu-icons/speedometer.svg' />
          </Link>
          <Link className="nav-link nav-link-sidebar" to="/commands">
            Command Builder
            <img style={styles.icon} alt='Command Builder nav logo' src='./images/menu-icons/command.svg' />
          </Link>
          <Link className="nav-link nav-link-sidebar" to="/beta">
            Testing Area
            <img style={styles.icon} alt='Testing Area nav logo' src='./images/menu-icons/gear-wide-connected.svg' />
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
          <Button variant="outline-light rounded-more" onClick={signOut}>
            Sign Out
          </Button>
        </Form>
      </Navbar.Collapse>
    </Navbar>
  );
}
