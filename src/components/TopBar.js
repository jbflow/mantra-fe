import React, { useState } from "react";
import { Navbar, Button } from "react-bootstrap";
import UserModal from "./UserManage/UserModal";

export default function TopBar({ signOut }) {
  const [showAccountModal, setShowAccountModal] = useState(false)

  const handleAccountModalClose = () => {
    setShowAccountModal(false)
  }
  return (
    <Navbar
      expand={false}
      className="fixed-top"
    >
      <div>
        <Navbar.Brand style={{ height: 36 }}>
          <img
            src="/images/menu-icons/tlkbck-not-listening.svg"
            alt="logo"
            style={{ display: "inline", width: 55 }}
          />
          <span
            style={{
              color: "#FFFFFF",
              margin: 0,
              fontSize: "1.5rem",
              letterSpacing: "1px",
              fontWeight: "bold",
              marginLeft: "10px",
              marginTop: "5px",
            }}
          >
            TLKBCK
          </span>
        </Navbar.Brand>
      </div>

      <div>

        <img
          src="/images/menu-icons/user.svg"
          alt="user icon"
          style={{ display: "inline", width: 30, marginRight: "20px" }}
          onClick={() => { setShowAccountModal(true) }}
        />
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
      <UserModal showAccountModal={showAccountModal} handleAccountModalClose={handleAccountModalClose} />
    </Navbar>
  );
}
