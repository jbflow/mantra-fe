import React, { useState, useRef } from "react";
import { BsPencil } from "react-icons/bs";
import DeleteModal from "./DeleteModal";

export default function CommandItem({
  command,
  editing,
  selected,
  setSelected,
  setEditing,
  dispatch,
}) {
  const changedValue = useRef(null);

  const [showModal, setShowModal] = useState(false);

  const updateCmd = (id) => {
    dispatch({
      type: "UPDATE_CMD",
      payload: { id: id, command: changedValue.current },
    });
    setEditing(null);
  };

  const delCmd = (id) => {
    dispatch({
      type: "DELETE_CMD",
      payload: { id: id },
    });
  };



  if (editing) {
    return (
      <>
        <div className="cmd-row cmd-r-editing">
          <div
            className="cmd-button cmd-button-close"
            onClick={() => {
              setSelected(null);
              setShowModal(true);
            }}
          >
            <button className="accessible-btn" aria-label={`${command.command} trash button`}>
              <img alt="trash icon" src="./images/menu-icons/trash2.svg" />
            </button>
          </div>
          <div className="cmd-input">
            <input
              type="text"
              autoFocus
              defaultValue={command.command}
              onChange={(e) => {
                changedValue.current = e.target.value;
              }}
              onKeyDown={(e) => {
                if (e.key === "Enter") updateCmd(command.id);
              }}
            />
          </div>
          <div
            className="cmd-button cmd-button-tick"
            onClick={() => {
              updateCmd(command.id);
            }}
          >
            <button className="accessible-btn" aria-label={`${command.command} confirm button`}>
              <img alt="" src="./images/menu-icons/check.svg" />
            </button>
          </div>
          <div
            className="cmd-button cmd-button-close"
            onClick={() => {
              setEditing(null);
            }}
          >
            <button className="accessible-btn" aria-label={`${command.command} close button`}>
              <img alt="" className="close-button" src="./images/menu-icons/close.svg" />
            </button>
          </div>
        </div>
        {showModal ? (
          <DeleteModal
            delCmd={delCmd}
            id={command.id}
            setShowModal={setShowModal}
          />
        ) : null}
      </>
    );
  } else if (selected) {
    return (
      <>
        <div className="cmd-row cmd-r-selected">
          <div
            className="cmd-button cmd-button-close"
            onClick={() => {
              setSelected(null);
              setShowModal(true);
            }}
          >
            <button className="accessible-btn" aria-label={`${command.command} trash button`}>
              <img alt="" src="./images/menu-icons/trash2.svg" />
            </button>
          </div>

          <div
            className="cmd-input"
            style={{ width: "273px" }}
            onDoubleClick={() => {
              setEditing(command.id);
              changedValue.current = command.command;
            }}
          >
            <button class="accessible-btn" style={{ margin: "2px" }} aria-label={`${command.command} command, press enter to open the edit window`}>{command.command}</button>
          </div>

          <div
            className="cmd-button cmd-button-edit"
            onClick={() => {
              setEditing(command.id);
              changedValue.current = command.command;
            }}
          >
            <BsPencil />
          </div>
        </div>
        {showModal ? (
          <DeleteModal
            delCmd={delCmd}
            id={command.id}
            setShowModal={setShowModal}
          />
        ) : null}
      </>
    );
  }
  else {
    return (
      <>
        <div className="cmd-row cmd-r-default">
          <div
            className="cmd-button cmd-button-close"
            onClick={() => {
              setShowModal(true);
            }}
          >
            <button className="accessible-btn" aria-label={`${command.command} trash button`}>
              <img alt="" src="./images/menu-icons/trash2.svg" />
            </button>
          </div>
          <div
            style={{ width: "335px" }}
            className="cmd-input"
            onClick={() => {
              setSelected(command.id);
              setEditing(null);
            }}
            onDoubleClick={() => {
              setEditing(command.id);
              changedValue.current = command.command;
            }}
          >
            <button class="accessible-btn" style={{ margin: "2px" }} aria-label={`${command.command} command, press enter to open the edit window`}>
              {command.command}
            </button>
          </div>
        </div>
        {showModal ? (
          <DeleteModal
            delCmd={delCmd}
            id={command.id}
            setShowModal={setShowModal}
          />
        ) : null}
      </>
    );
  }
}
