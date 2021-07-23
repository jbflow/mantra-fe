import React from "react";

export default function VoiceAction({ action }) {
  return (
    <>
      <div className="action-container">
        <div className="action-input">
          <div className="action-grab">
            <img src="./images/menu-icons/grip.svg" />
          </div>
          <input defaultValue={action} />
        </div>
        <div>
          <div className="cmd-button cmd-button-dupl">d</div>
          <div className="cmd-button cmd-button-close">
            <img className="close-button" src="./images/menu-icons/close.svg" />
          </div>
        </div>
      </div>
    </>
  );
}
