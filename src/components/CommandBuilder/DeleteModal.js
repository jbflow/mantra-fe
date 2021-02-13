import React, { useState } from "react";
import { Col, Modal, Button } from "react-bootstrap";
import { GrFormTrash } from "react-icons/gr";
import { IconContext } from "react-icons";

export default function DeleteModal({ deleteCommand, command }) {
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
        <GrFormTrash onClick={handleShow} />
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
            <Button variant="danger" onClick={() => { deleteCommand(command); setShow(false); }}>
              Delete
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
