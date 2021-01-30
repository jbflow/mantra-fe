import React, { Component } from "react";
import { DragDropContext, Droppable, Draggable } from "react-beautiful-dnd";
import { GrDrag, GrDuplicate, GrFormTrash, GrAddCircle } from "react-icons/gr";
import { BiUserVoice } from "react-icons/bi";
import { IconContext } from "react-icons";
import { Container, Card, Row, Col, Form } from "react-bootstrap";
import { API } from "aws-amplify";

const classNames = require("classnames");

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
    API.get("talkbackBE", "/commands").then((res) => {
      res.forEach((obj) => {
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
    API.post("talkbackBE", "/commands", updatedAction);
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
      <Card>
        <Card.Header></Card.Header>
        <Card.Body>
          <DragDropContext onDragEnd={this.handleOneDragEnd}>
            <Droppable droppableId="actions">
              {(provided) => (
                <Container {...provided.droppableProps} ref={provided.innerRef}>
                  {this.state.actions.map((action, index) => {
                    return (
                      <Draggable
                        key={index}
                        draggableId={index.toString()}
                        index={index}
                      >
                        {(provided) => (
                          <Form.Group
                            as={Row}
                            {...provided.draggableProps}
                            ref={provided.innerRef}
                            className="border rounded border-dark mt-2 ml-2 mr-2 text-right"
                          >
                            <Col
                              className="pt-1"
                              sm={0.5}
                              {...provided.dragHandleProps}
                            >
                              <IconContext.Provider
                                value={{
                                  style: {
                                    fontSize: "30px",
                                  },
                                }}
                              >
                                <GrDrag />
                              </IconContext.Provider>
                            </Col>
                            <Col sm={10}>
                              <Form.Control
                                plaintext
                                value={action}
                                name="action"
                                className="form-control"
                                placeholder="Enter voice action..."
                                onChange={(event) =>
                                  this.onChange(event, index)
                                }
                              />
                            </Col>

                            <Col className="pt-1 pr-2 text-right" sm={1}>
                              {this.state.actions.length - 1 === index && (
                                <IconContext.Provider
                                  value={{
                                    style: {
                                      fontSize: "20px",
                                      cursor: "pointer",
                                    },
                                  }}
                                >
                                  <GrAddCircle onClick={this.handleAddAction} />
                                </IconContext.Provider>
                              )}
                            </Col>

                            <Col className="pt-1 pr-2 text-right" sm={0.5}>
                              <IconContext.Provider
                                value={{
                                  style: {
                                    fontSize: "20px",
                                    cursor: "pointer",
                                  },
                                }}
                              >
                                <GrDuplicate
                                  onClick={(index) => {
                                    this.handleDuplicateAction(index);
                                  }}
                                />
                              </IconContext.Provider>
                            </Col>

                            <Col className="text-right" sm={0.5}>
                              {this.state.actions.length !== 1 && (
                                <IconContext.Provider
                                  value={{
                                    style: {
                                      fontSize: "30px",
                                      cursor: "pointer",
                                    },
                                  }}
                                >
                                  <GrFormTrash
                                    onClick={(index) => {
                                      this.handleDeleteAction(index);
                                    }}
                                  />
                                </IconContext.Provider>
                              )}
                            </Col>
                          </Form.Group>
                        )}
                      </Draggable>
                    );
                  })}
                  {provided.placeholder}
                </Container>
              )}
            </Droppable>
          </DragDropContext>
        </Card.Body>
      </Card>
    );
  }
}
