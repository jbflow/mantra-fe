import React from "react";

export default function DeleteModal({ delCmd, id, setShowModal }) {
  return (
    <>
      <div className="delete-modal">
        <div className="delete-modal-content">
          <p className="delete-modal-font">
            Are you sure you want to delete this Macro? This cannot be undone!
          </p>
          <div>
            <button
              className="delete-cancel"
              onClick={() => {
                setShowModal(false);
              }}
            >
              Cancel
            </button>
            <button
              className="delete-confirm"
              onClick={() => {
                delCmd(id);
              }}
            >
              Delete
            </button>
          </div>
        </div>
      </div>
    </>
  );
}
