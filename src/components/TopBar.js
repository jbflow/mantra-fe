import React from "react";
import { Navbar, Button } from "react-bootstrap";
import Logo from "../images/tlkbck.svg"; // relative path to image

export default function TopBar({ signOut }) {
  return (
    <Navbar
      variant="dark"
      expand={false}
      style={{ border: "1px solid #E4E4E4" }}
      className="fixed-top bg-white"
    >
      <div>
        <Navbar.Brand style={{ height: 36 }}>
          <img
            src={Logo}
            alt="logo"
            style={{ display: "inline", width: 30, marginLeft: 25 }}
          />
          <span
            style={{
              color: "#000000",
              margin: 0,
              // fontSize: "1.5rem",
              letterSpacing: "1px",
              fontWeight: "bold",
              marginLeft: "10px",
              marginTop: "5px",
            }}
          >
            tlkbck
          </span>
        </Navbar.Brand>
      </div>
      {/* <Navbar.Toggle aria-controls="navigation" /> */}
      <div>
        {/* <IconContext.Provider
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
        </IconContext.Provider> */}
        <Button
          variant="dark"
          block={false}
          onClick={signOut}
          style={{ margin: "initial" }}
          className="rounded-more"
        >
          Sign Out
        </Button>
      </div>
    </Navbar>
  );
}
