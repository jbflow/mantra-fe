import React, { useEffect, useState } from "react";
import { DragDropContext, Droppable, Draggable } from "react-beautiful-dnd";

import { API } from "aws-amplify";

export default function Actions({ commands, selected }) {
  return (
    <>
      <div className="actions-card">
        <div className="actions-card-header">
          <h5>Command Name</h5>
          <p>Actions</p>
          <span>Last Editied...</span>
        </div>
        <div className="actions-card-body"></div>
      </div>
    </>
  );
}
