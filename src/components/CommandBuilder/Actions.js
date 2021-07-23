import React, { useEffect, useState } from "react";
import { DragDropContext, Droppable, Draggable } from "react-beautiful-dnd";
import VoiceAction from "./VoiceAction";

export default function Actions({ command, selected }) {
  return (
    <>
      <div className="actions-card">
        <div className="actions-card-header">
          <div>
            <h5>{command.command}</h5>
            <img src="./images/menu-icons/close.svg" />
          </div>
          <p>Actions</p>
        </div>
        <hr />
        <div className="actions-card-body">
          {command.actions.map((action, key) => (
            <VoiceAction key={key} action={action} />
          ))}
          <button className="add-action-button">+</button>
        </div>

        <div className="actions-card-footer">
          <button className="btn-lg">
            <p>Save</p>
          </button>
          <button className="btn-lg">
            <p>Test</p>
          </button>
        </div>
      </div>
    </>
  );
}
