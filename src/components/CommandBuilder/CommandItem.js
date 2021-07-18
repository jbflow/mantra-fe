import React from "react";
import { BsPencil } from "react-icons/bs";

export default function CommandItem({
  command,
  editing,
  selected,
  setSelected,
  setEditing,
  del,
  accept,
  cancel,
}) {
  console.log(editing);
  if (editing) {
    return (
      <>
        <div className="cmd-row-editing">
          <div className="cmd-button cmd-button-close">
            <img
              className="trash-button"
              src="./images/menu-icons/trash2.svg"
            />
          </div>
          <div className="cmd-input-container">
            <input className="cmd-input" defaultValue={command.command} />
          </div>
          <div className="cmd-button cmd-button-tick">
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
        <div className="cmd-row-editing">
          <div className="cmd-button">
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
            className="cmd-button"
            onClick={() => {
              setEditing(command.id);
            }}
          >
            <BsPencil />
          </div>
        </div>
      </>
    );
  } else {
    return (
      <>
        <div className="cmd-row-default">
          <div className="cmd-button">
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
        </div>
      </>
    );
  }
}
