import React, { useEffect, useState } from "react";
import { DragDropContext, Droppable, Draggable } from "react-beautiful-dnd";
import VoiceAction from "./VoiceAction";
import MidiAction from "./MidiAction";


export default function Actions({
  command,
  selected,
  setSelected,
  dispatch,
  postLoading,
}) {
  const [actions, setActions] = useState(command.actions);
  // const [testActions, setTestActions] = useState([]);
  const [showAddButtons, setShowAddButtons] = useState(false);


  const voiceActionChanged = (e, i) => {
    const newActions = [...actions];
    newActions[i] = { type: "voice", data: e.target.value }
    setActions(newActions);
  };

  const midiActionChanged = (port, channel, type, data, value, i) => {
    console.log(port)
    const newActions = [...actions]
    const midiData = { port: port, channel: channel, type: type, data: data, value: value }
    newActions[i] = { type: "midi", data: midiData }
    setActions(newActions)

  }

  const addVoiceAction = () => {
    setActions([...actions, { type: "voice", data: "" }]);
  };

  const addMidiAction = () => {
    setActions([...actions, { type: "midi", data: { port: "", msg: [] } }]);
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

  useEffect(() => {
    console.log(actions)
  }, [actions])

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
              <img src="./images/menu-icons/close.svg" alt="menu close" />
            </button>
          </div>
          <p>Actions</p>
        </div>
        <hr style={{ width: "100%" }} />
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

                    action.type !== "midi" ?
                      <Draggable key={key} draggableId={key.toString()} index={key}>
                        {(provided) => (
                          <div{...provided.draggableProps} ref={provided.innerRef}>

                            <VoiceAction
                              key={`${key}`}
                              index={key}
                              data={action.data}
                              voiceActionChanged={voiceActionChanged}
                              delAction={delAction}
                              duplAction={duplAction}
                              provided={provided}
                            />
                          </div>
                        )}
                      </Draggable>
                      :
                      <Draggable key={key} draggableId={key.toString()} index={key}>
                        {(provided) => (
                          <div{...provided.draggableProps} ref={provided.innerRef}>

                            <MidiAction
                              key={`${key}`}
                              index={key}
                              data={JSON.stringify(action.data)}
                              midiActionChanged={midiActionChanged}
                              delAction={delAction}
                              duplAction={duplAction}
                              provided={provided}
                            />
                          </div>
                        )}
                      </Draggable>


                  )) : null}
                {provided.placeholder}
              </div>
            )}
          </Droppable>
        </DragDropContext>

        <div className="actions-card-footer">

          <button
            className={showAddButtons ? "add-action-button add-action-button-clicked" : "add-action-button"}
            onClick={() => {
              setShowAddButtons(!showAddButtons);
            }}
            onBlur={() => {
              setShowAddButtons(false);
            }}
          >
            <img src="./images/menu-icons/plus.svg" alt="menu plus icon" />
          </button>
          {showAddButtons ? (
            <div className="add-action-list">
              <button
                onMouseDown={(e) => {
                  e.preventDefault();
                }}
                onClick={(e) => {
                  addVoiceAction();
                }}
              >
                <img src="./images/menu-icons/soundwave.svg" alt="menu sound icon" />
                Add voice action
              </button>
              <button
                onMouseDown={(e) => {
                  e.preventDefault();
                }}
                onClick={(e) => {
                  addMidiAction();
                }}>
                <img src="./images/menu-icons/midi.svg" alt="add midi action" />
                Add MIDI action
              </button>
            </div>
          ) : null}

          <button
            className="save-action-button"
            onClick={() => {
              dispatch({
                type: "UPDATE_ACTIONS",
                payload: { id: command.id, actions: actions },
              });
            }}
            disabled={postLoading}
          >
            {postLoading ? "Saving..." : "Save"}
          </button>

        </div>

      </div>
    </>
  );
}
