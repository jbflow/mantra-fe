import React from "react";
import { Link } from "react-router-dom";
import { Navbar, Button } from "react-bootstrap";
import { FaCog } from "react-icons/fa";
import { IconContext } from "react-icons";

const Circ = () => (
  <svg
    viewBox="0 0 11 11"
    width="14"
    height="14">
    <circle
      stroke="#707070"
      fill="none"
      cx="5"
      cy="5"
      r="4" />
  </svg>
)

export default function TopBar({ signOut }) {
  return (
    <Navbar variant="dark" expand={false} style={{ border: '1px solid #E4E4E4' }}>
      <div>
        <Circ />
        <Circ />
        <Circ />
        <Navbar.Brand><p style={{ color: '#0069D9', margin: 0, marginLeft: '10px', lineHeight: '10px' }}>tlkbck</p></Navbar.Brand>
      </div>
      {/* <Navbar.Toggle aria-controls="navigation" /> */}
      <div>
        <IconContext.Provider
          value={{
            style: {
              fontSize: "20px",
              cursor: "pointer",
            },
          }}
        >
          <Link to="/prefs">
            <FaCog className="mr-sm-3" color="#6C757D" />
          </Link>
        </IconContext.Provider>
        <Button variant="dark" block={false} onClick={signOut} style={{ margin: 'initial' }}>
          Sign Out
        </Button>
      </div>
    </Navbar >
  );
}
