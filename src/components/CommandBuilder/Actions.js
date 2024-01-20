import React, { useEffect, useState, useContext } from "react";
import { DragDropContext, Droppable, Draggable } from "react-beautiful-dnd";
import VoiceAction from "./VoiceAction";
import { ServicesContext } from "../../contexts/ServicesContext";
import useCommands from "../../hooks/services/useCommands";

export default function Actions({
  command,
  selected,
  setSelected,
  dispatch,
  postLoading,
}) {
  const [actions, setActions] = useState(command.actions);
  const [testActions, setTestActions] = useState([]);
  const [showAddButtons, setShowAddButtons] = useState(false);
  const {confirmation } = useContext(ServicesContext);
  // useCommands(
  //   testActions,
  //   setTestActions,
  //   confirmation.confirm,
  //   confirmation.setConfirm
  // );

  const actionChanged = (e, i) => {
    const newActions = [...actions];
    newActions[i] = e.target.value;
    setActions(newActions);
  };

  const addAction = () => {
    setActions([...actions, ""]);
  };

  const delAction = (i) => {
    const newActions = [...actions];
    newActions.splice(i, 1);
    setActions(newActions);
  };

  const duplAction = (i) => {
    const newActions = [...actions];
    const action = newActions[i];
    newActions.splice(i, 0, action);
    setActions(newActions);
  };

  const handleOneDragEnd = (result) => {
    if (!result.destination) {
      return;
    }
    const items = Array.from(actions);
    const [reorderedItem] = items.splice(result.source.index, 1);
    items.splice(result.destination.index, 0, reorderedItem);
    setActions(items);
  };

  useEffect(() => {
    setActions(command.actions);
  }, [selected, command]);

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
        <DragDropContext onDragEnd={handleOneDragEnd}>
          <Droppable droppableId="actions">
            {(provided) => (
              <div
                {...provided.droppableProps}
                ref={provided.innerRef}
                className="actions-card-body"
              >
                {actions
                  ? actions.map((action, key) => (
                      <Draggable
                        key={key}
                        draggableId={key.toString()}
                        index={key}
                      >
                        {(provided) => (
                          <div
                            {...provided.draggableProps}
                            ref={provided.innerRef}
                          >
                            <VoiceAction
                              key={`${key}`}
                              index={key}
                              action={action}
                              actionChanged={actionChanged}
                              delAction={delAction}
                              duplAction={duplAction}
                              provided={provided}
                            />
                          </div>
                        )}
                      </Draggable>
                    ))
                  : null}

                {provided.placeholder}
              </div>
            )}
          </Droppable>
        </DragDropContext>

        <div className="actions-card-footer">
          <div>
            <button
              className="add-action-button"
              onClick={() => {
                setShowAddButtons(true);
              }}
              onBlur={() => {
                setShowAddButtons(false);
              }}
            >
              <img src="./images/menu-icons/plus.svg" />
            </button>
            {showAddButtons ? (
              <div className="add-action-list">
                <button
                  onMouseDown={(e) => {
                    e.preventDefault();
                  }}
                  onClick={(e) => {
                    console.log(e);
                    addAction();
                  }}
                >
                  <img src="./images/menu-icons/soundwave.svg" />
                  Add voice action
                </button>
                <button disabled={true}>
                  <img src="./images/menu-icons/midi.svg" />
                  Add MIDI action
                </button>
                <button disabled={true}>
                  <img src="./images/menu-icons/keyboard.svg" />
                  Add keyboard action
                </button>
              </div>
            ) : null}
          </div>
          <div>
            <button
              className="btn-lg"
              onClick={() => {
                dispatch({
                  type: "UPDATE_ACTIONS",
                  payload: { id: command.id, actions: actions },
                });
              }}
              disabled={postLoading}
            >
              <p>{postLoading ? "Saving..." : "Save"}</p>
            </button>
            <button
              className="btn-lg"
              onClick={() => {
                setTestActions(actions);
              }}
            >
              <p>Test</p>
            </button>
          </div>
        </div>
      </div>
    </>
  );
}
