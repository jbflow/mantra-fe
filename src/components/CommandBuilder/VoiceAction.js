import React from "react";
import { IoMdCopy } from "react-icons/io";

export default function VoiceAction({
  index,
  action,
  actionChanged,
  delAction,
  duplAction,
  provided,
}) {
  return (
    <>
      <div className="action-container">
        <div className="action-input">
          <div className="action-icon">
            <img alt="" src="./images/menu-icons/soundwave.svg" />
          </div>
          <div className="action-grab" {...provided.dragHandleProps}>
            <img alt="" src="./images/menu-icons/grip.svg" />
          </div>
          <input
            type="text"
            value={action}
            onChange={(e) => {
              actionChanged(e, index);
            }}
            autoFocus
          />
        </div>
        <div>
          <div
            className="cmd-button cmd-button-dupl"
            onClick={() => {
              duplAction(index);
            }}
          >
            <IoMdCopy />
          </div>
          <div
            className="cmd-button cmd-button-close"
            onClick={() => {
              delAction(index);
            }}
          >
            <img alt="" className="close-button" src="./images/menu-icons/close.svg" />
          </div>
        </div>
      </div>
    </>
  );
}
