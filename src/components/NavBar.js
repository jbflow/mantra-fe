import React, { Fragment } from "react";
import { Link } from "react-router-dom";
import { Navbar, Nav, Form, Col, Button } from "react-bootstrap";
import { FaCog } from "react-icons/fa";
import { IconContext } from "react-icons";

export default function NavBar() {
  return (
    <Navbar bg="dark" variant="dark">
      <Navbar.Brand>Orunoko</Navbar.Brand>
      <Nav className="mr-auto">
        <Nav.Link href="dashboard">Dashboard</Nav.Link>
        <Nav.Link href="commands">Command Builder</Nav.Link>
        <Nav.Link href="beta">Testing Area</Nav.Link>
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
          <FaCog className="mr-3" color="white" />
        </Link>
      </IconContext.Provider>
      <Form inline>
        <Button variant="outline-light">Sign Out</Button>
      </Form>
    </Navbar>
  );
}
