import React from "react";
import { IoMdCopy } from "react-icons/io";

export default function VoiceAction({
  index,
  data,
  handleVoiceActionChanged,
  delAction,
  duplicateAction,
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
            value={data}
            onChange={(e) => {
              handleVoiceActionChanged(e, index);
            }}
            autoFocus
          />
        </div>
        <div>
          <button
            className="accessible-btn cmd-button cmd-button-dupl"
            onClick={() => {
              duplicateAction(index);
            }}
            aria-label={`${data} action duplicate button`}
          >
            <IoMdCopy />
          </button>
          <button
            className="accessible-btn cmd-button cmd-button-close"
            onClick={() => {
              delAction(index);
            }}
            aria-label={`${data} action delete button`}
          >
            <img alt="" className="close-button" src="./images/menu-icons/close.svg" />
          </button>
        </div>
      </div>
    </>
  );
}
