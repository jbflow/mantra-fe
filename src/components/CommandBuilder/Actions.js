import React, { useEffect, useState, useRef } from "react";
import { DragDropContext, Droppable, Draggable } from "react-beautiful-dnd";
import VoiceAction from "./VoiceAction";

export default function Actions({ command, selected, setSelected }) {
  const [actions, setActions] = useState(command.actions);
  const actionsCopy = useRef(null);
  const focusedRef = useRef(null);

  const actionChanged = (e, i) => {
    actionsCopy.current = actions.slice();
    actionsCopy.current[i] = e.target.value;
    focusedRef.current = i;
    setActions(false);
  };

  const addAction = () => {
    actionsCopy.current = actions.slice();
    setActions([...actionsCopy.current, ""]);
  };

  const delAction = (i) => {
    actionsCopy.current = actions.slice();
    actionsCopy.current.splice(i, 1);
    setActions(false);
  };

  const duplAction = (i) => {
    console.log(i);
    actionsCopy.current = actions.slice();
    actionsCopy.current.splice(i, 0, actions[i]);
    console.log(actionsCopy.current);
    setActions(false);
  };

  useEffect(() => {
    setActions([]);
  }, [selected, command]);

  useEffect(() => {
    if (actions && actions.length === 0) {
      setActions(command.actions);
    } else if (!actions) {
      setActions(actionsCopy.current);
    }
  }, [actions]);
  return (
    <>
      <div className="actions-card">
        <div className="actions-card-header">
          <div>
            <h5>{command.command}</h5>
            <button
              className="actions-button-close"
              onClick={() => setSelected(null)}
            >
              <img src="./images/menu-icons/close.svg" />
            </button>
          </div>
          <p>Actions</p>
        </div>
        <hr />
        <div className="actions-card-body">
          {actions
            ? actions.map((action, key) => (
                <VoiceAction
                  key={`${key}`}
                  index={key}
                  action={action}
                  actionChanged={actionChanged}
                  delAction={delAction}
                  duplAction={duplAction}
                  focus={focusedRef.current === key}
                />
              ))
            : null}
          <button
            className="add-action-button"
            onClick={() => {
              addAction();
            }}
          >
            +
          </button>
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
