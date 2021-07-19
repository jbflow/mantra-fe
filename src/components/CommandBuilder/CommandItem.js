import React, { useRef } from "react";
import { BsPencil } from "react-icons/bs";

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
          <div
            className="cmd-button cmd-button-close"
            onClick={() => {
              delCmd(command.id);
            }}
          >
            <img
              className="trash-button"
              src="./images/menu-icons/trash2.svg"
            />
          </div>
          <div className="cmd-input-container">
            <input
              className="cmd-input"
              defaultValue={command.command}
              onChange={(e) => {
                changedValue.current = e.target.value;
              }}
            />
          </div>
          <div
            className="cmd-button cmd-button-tick"
            onClick={() => {
              updateCmd(command.id);
            }}
          >
            <img className="check-button" src="./images/menu-icons/check.svg" />
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
            <img
              className="trash-button"
              src="./images/menu-icons/trash2.svg"
            />
          </div>
          <div className="cmd-input-container">
            <span style={{ margin: "2px" }} className="cmd-input">
              {command.command}
            </span>
          </div>
          <div className="cmd-button"></div>
          <div
            className="cmd-button cmd-button-edit"
            onClick={() => {
              setEditing(command.id);
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
          <div className="cmd-input-container">
            <input
              className="cmd-input"
              onChange={(e) => {
                newValue.current = e.target.value;
              }}
            />
          </div>

          <div
            style={{ width: "61px" }}
            className="cmd-button cmd-button-tick"
            onClick={() => {
              addCmd();
            }}
          ></div>
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
              delCmd(command.id);
            }}
          >
            <img
              className="trash-button"
              src="./images/menu-icons/trash2.svg"
            />
          </div>
          <div
            className="cmd-input-container"
            onClick={() => {
              setSelected(command.id);
            }}
          >
            <span style={{ margin: "2px" }} className="cmd-input">
              {command.command}
            </span>
          </div>
          <div className="cmd-button"></div>
          <div className="cmd-button"></div>
        </div>
      </>
    );
  }
}
