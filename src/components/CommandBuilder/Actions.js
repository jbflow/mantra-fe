import React, { Component } from "react";
import axios from "axios";
import { HTTP_API_URL } from "../../utils/Constants";
import { DragDropContext, Droppable, Draggable } from "react-beautiful-dnd";
import {
  GrDrag,
  GrDuplicate,
  GrFormTrash,
  GrFormAdd,
  GrKeyboard,
} from "react-icons/gr";
import { BiUserVoice } from "react-icons/bi";
import { IconContext } from "react-icons";

export default class Actions extends Component {
  constructor(props) {
    super(props);
    this.state = {
      actions: [],
      selected: null,
      currentID: null,
    };
  }
  componentDidUpdate() {
    axios.get(HTTP_API_URL + "/commands").then((res) => {
      res.data.forEach((obj) => {
        if (
          obj.command === this.props.selected &&
          this.state.selected !== this.props.selected
        ) {
          this.setState({ actions: obj.actions });
          this.setState({ selected: this.props.selected });
          this.setState({ currentID: obj.id });
        }
      });
    });
  }

  onChange = (event, index) => {
    const newActions = this.state.actions;
    newActions[index] = event.target.value;
    this.setState({ actions: newActions });
  };

  handleAddAction = () => {
    this.setState({ actions: [...this.state.actions, ""] });
  };

  handleDeleteAction = (index) => {
    const newActions = this.state.actions;
    newActions.splice(index, 1);
    this.setState({ actions: newActions });
  };

  handleDuplicateAction = (index) => {
    const actions = this.state.actions;
    const action = actions[index];
    actions.splice(index, 0, action);
    this.setState({ actions: actions });
  };

  saveActions = () => {
    const updatedAction = {
      command: this.state.selected,
      actions: this.state.actions,
    };
    axios.post(HTTP_API_URL + "/commands", updatedAction);
  };

  handleOneDragEnd = (result) => {
    if (!result.destination) {
      return;
    }
    const items = Array.from(this.state.actions);
    const [reorderedItem] = items.splice(result.source.index, 1);
    items.splice(result.destination.index, 0, reorderedItem);
    this.setState({ actions: items });
  };

  render() {
    return (
      <div className="card border-primary mb-3">
        <div className="card-header">Actions</div>
        <div className="card-body">
          <DragDropContext onDragEnd={this.handleOneDragEnd}>
            <Droppable droppableId="actions">
              {(provided) => (
                <ul
                  style={{ listStyle: "none" }}
                  {...provided.droppableProps}
                  ref={provided.innerRef}
                >
                  {this.state.actions.map((action, index) => {
                    return (
                      <Draggable
                        key={index}
                        draggableId={index.toString()}
                        index={index}
                      >
                        {(provided) => (
                          <li
                            {...provided.draggableProps}
                            ref={provided.innerRef}
                          >
                            <table className="table table-sm">
                              <colgroup>
                                <col span="1" style={{ width: "5%" }}></col>
                                <col span="1" style={{ width: "80%" }}></col>
                                <col span="1" style={{ width: "5%" }}></col>
                                <col span="1" style={{ width: "5%" }}></col>
                              </colgroup>
                              <tbody>
                                <tr>
                                  <td {...provided.dragHandleProps}>
                                    <IconContext.Provider
                                      value={{
                                        style: {
                                          fontSize: "30px",
                                          verticalAlign: "middle",
                                        },
                                      }}
                                    >
                                      <GrDrag />
                                    </IconContext.Provider>
                                  </td>
                                  <td>
                                    <input
                                      type="text"
                                      value={action}
                                      name="action"
                                      className="form-control"
                                      placeholder="Enter voice action..."
                                      onChange={(event) =>
                                        this.onChange(event, index)
                                      }
                                    />
                                  </td>
                                  <td>
                                    <button className="btn btn-outline-primary">
                                      <IconContext.Provider
                                        value={{ style: { fontSize: "20px" } }}
                                      >
                                        <GrDuplicate />
                                      </IconContext.Provider>
                                    </button>
                                  </td>

                                  <td>
                                    <button className="btn btn-outline-danger">
                                      <IconContext.Provider
                                        value={{ style: { fontSize: "20px" } }}
                                      >
                                        <GrFormTrash />
                                      </IconContext.Provider>
                                    </button>
                                  </td>
                                </tr>
                              </tbody>
                            </table>
                          </li>
                        )}
                      </Draggable>
                    );
                  })}
                  {provided.placeholder}
                </ul>
              )}
            </Droppable>
          </DragDropContext>

          {this.state.selected && (
            <div>
              <div className="card-body">
                <IconContext.Provider value={{ style: { fontSize: "80px" } }}>
                  <BiUserVoice />
                </IconContext.Provider>
                <IconContext.Provider value={{ style: { fontSize: "80px" } }}>
                  <GrKeyboard />
                </IconContext.Provider>
              </div>
              <div className="modal-footer">
                <button
                  style={{ width: "15%" }}
                  type="button"
                  className="btn btn-lg btn-primary"
                  onClick={() => {
                    this.saveActions();
                  }}
                >
                  Save
                </button>

                <button
                  style={{ width: "15%" }}
                  type="button"
                  className="btn btn-lg btn-primary"
                  onClick={() => {}}
                >
                  Test
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    );
  }
}
