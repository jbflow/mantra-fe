import React, { useEffect, useState } from "react";

export default function VoiceAction({
  index,
  action,
  actionChanged,
  delAction,
  duplAction,
  focus,
}) {
  return (
    <>
      <div key={`c${index}`} className="action-container">
        <div key={`a${index}`} className="action-input">
          <div className="action-grab">
            <img src="./images/menu-icons/grip.svg" />
          </div>
          <input
            key={`i${index}`}
            type="text"
            value={action}
            onChange={(e) => {
              actionChanged(e, index);
            }}
            autoFocus={focus} // FIX THIS
          />
        </div>
        <div>
          <div
            className="cmd-button cmd-button-dupl"
            onClick={() => {
              duplAction(index);
            }}
          >
            d
          </div>
          <div
            className="cmd-button cmd-button-close"
            onClick={() => {
              delAction(index);
            }}
          >
            <img className="close-button" src="./images/menu-icons/close.svg" />
          </div>
        </div>
      </div>
    </>
  );
}
