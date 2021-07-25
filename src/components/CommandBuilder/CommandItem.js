import React, { useState, useRef } from "react";
import { BsPencil } from "react-icons/bs";
import DeleteModal from "./DeleteModal";

export default function CommandItem({
  command,
  editing,
  selected,
  setSelected,
  setEditing,
  addCommand,
  dispatch,
}) {
  const changedValue = useRef(null);
  const newValue = useRef(null);
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

  const addCmd = (cmd) => {
    dispatch({
      type: "ADD_CMD",
      payload: newValue.current,
    });
  };

  if (editing) {
    return (
      <>
        <div className="cmd-row cmd-r-editing">
          <div className="cmd-button cmd-button-close" onClick={() => {}}>
            <img src="./images/menu-icons/trash2.svg" />
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
            <img src="./images/menu-icons/check.svg" />
          </div>
          <div
            className="cmd-button cmd-button-close"
            onClick={() => {
              setEditing(null);
            }}
          >
            <img className="close-button" src="./images/menu-icons/close.svg" />
          </div>
        </div>
      </>
    );
  } else if (selected) {
    return (
      <>
        <div className="cmd-row cmd-r-selected">
          <div
            className="cmd-button cmd-button-close"
            onClick={() => {
              delCmd(command.id);
            }}
          >
            <img src="./images/menu-icons/trash2.svg" />
          </div>

          <div
            className="cmd-input"
            style={{ width: "273px" }}
            onDoubleClick={() => {
              setEditing(command.id);
              changedValue.current = command.command;
            }}
          >
            <span style={{ margin: "2px" }}>{command.command}</span>
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
      </>
    );
  } else if (addCommand) {
    return (
      <>
        <div className="cmd-row cmd-r-add">
          <input
            placeholder="Type new command here"
            type="text"
            onChange={(e) => {
              newValue.current = e.target.value;
            }}
            onKeyDown={(e) => {
              if (e.key === "Enter") addCmd();
            }}
          />

          <div
            className="cmd-button cmd-button-add"
            onClick={() => {
              addCmd();
            }}
          >
            <img className="trash-button" src="./images/menu-icons/plus.svg" />
          </div>
        </div>
      </>
    );
  } else {
    return (
      <>
        <div className="cmd-row cmd-r-default">
          <div
            className="cmd-button cmd-button-close"
            onClick={() => {
              setShowModal(true);
            }}
          >
            <img src="./images/menu-icons/trash2.svg" />
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
            <span style={{ margin: "2px" }} className="cmd-input">
              {command.command}
            </span>
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
