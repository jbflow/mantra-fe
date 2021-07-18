import React, { useState } from "react";
import { Col, Modal, Button } from "react-bootstrap";
import { IconContext } from "react-icons";
import { IoMdClose } from "react-icons/io";

export default function DeleteModal({ deleteCommand, command, isDeleting }) {
  const [show, setShow] = useState(false);
  const handleClose = () => setShow(false);
  const handleShow = () => setShow(true);

  return (
    <>
      <IconContext.Provider
        value={{
          style: {
            fontSize: "30px",
            cursor: "pointer",
          },
        }}
      >
        <IoMdClose onClick={handleShow} />
      </IconContext.Provider>

      <Modal size="sm" show={show} onHide={handleClose} animation={false}>
        <Modal.Header className="bg-danger text-white">
          <Modal.Title>Warning!</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          Are you sure you want to delete? This cannot be undone!
        </Modal.Body>
        <Modal.Footer className="pb-2">
          <Col>
            <Button
              disabled={isDeleting}
              variant="danger"
              onClick={() => {
                deleteCommand(command);
              }}
            >
              {isDeleting ? "Deleting..." : "Delete"}
            </Button>
          </Col>
          <Col>
            <Button variant="secondary" onClick={handleClose}>
              Cancel
            </Button>
          </Col>
        </Modal.Footer>
      </Modal>
    </>
  );
}
