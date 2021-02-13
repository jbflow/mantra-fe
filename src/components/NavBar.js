import React from "react";
import { Link } from "react-router-dom";
import { Navbar, Nav, Form, Button } from "react-bootstrap";
import { FaCog } from "react-icons/fa";
import { IconContext } from "react-icons";

export default function NavBar({ signOut }) {
  return (
    <Navbar bg="dark" variant="dark" expand="lg">
      <Navbar.Brand>Orunoko</Navbar.Brand>
      <Navbar.Toggle aria-controls="navigation" />
      <Navbar.Collapse id="navigation">
        <Nav className="mr-auto">
          <Link className="nav-link" to="/dashboard">Dashboard</Link>
          <Link className="nav-link" to="/commands">Command Builder</Link>
          <Link className="nav-link" to="/beta">Testing Area</Link>
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
          <Button variant="outline-light" onClick={signOut}>Sign Out</Button>
        </Form>
      </Navbar.Collapse>
    </Navbar>
  );
}
