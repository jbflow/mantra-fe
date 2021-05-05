import React, { useState } from "react";

import { Button, Modal } from "react-bootstrap";

export default function Subscription() {
  const [show, setShow] = useState(true);
  const handleClose = () => setShow(false); // Handle a redirect to dashboard
  
  return (
    <div>
      <Modal
        show={show}
        onHide={handleClose}
        backdrop="static"
        keyboard={false}
        centered
      >
        <Modal.Header>
          <Modal.Title className="mx-auto">Purchase A Subscription</Modal.Title>
        </Modal.Header>
        <Modal.Body className="m-auto py-3">
          Stripe card will be entered here.
        </Modal.Body>
        <Modal.Footer>
          <Button variant="primary" onClick={handleClose} className="mx-auto my-3">
            (Redirect automatically when paid instead of button)
          </Button>
        </Modal.Footer>
      </Modal>
    </div>
  );
}
