import React, { Component } from "react";
import { DragDropContext, Droppable, Draggable } from "react-beautiful-dnd";
import { GrDrag, GrDuplicate, GrAddCircle } from "react-icons/gr";
import { IconContext } from "react-icons";
import { Container, Card, Row, Col, Form, Button } from "react-bootstrap";
import { API } from "aws-amplify";
import DeleteModal from "./DeleteModal";
export default class Actions extends Component {
  constructor(props) {
    super(props);
    this.state = {
      actions: [],
      selected: null,
      currentID: null,
      saving: false,
    };
  }
  componentDidUpdate() {
    API.get("talkbackBE", "/commands?userId=" + this.props.userId).then(
      (res) => {
        res.forEach((command) => {
          if (
            command.id === this.props.selected &&
            this.state.selected !== this.props.selected
          ) {
            console.log('actiosn command', command);
            this.setState({ command: command.command });
            this.setState({ actions: command.actions });
            this.setState({ selected: this.props.selected });
            this.setState({ currentID: command.id });
          }
        });
      }
    );
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
    console.log(this.state.actions);
    this.setState({ saving: true });
    API.patch(
      "talkbackBE",
      "/commands?userId=" +
      this.props.userId +
      "&commandId=" +
      this.state.selected +
      "&patching=actions",
      { body: this.state.actions }
    ).then((res) => {
      this.setState({ saving: false });
    });
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
      <Card className="mt-3" bg={"light"} text={"dark"}>
        <Card.Header className="bg-primary text-light">
          {this.state.command}
        </Card.Header>

        <Card.Body>
          <DragDropContext onDragEnd={this.handleOneDragEnd}>
            <Droppable droppableId="actions">
              {(provided) => (
                <Container
                  fluid
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
                                  onClick={() => {
                                    this.handleDuplicateAction(index);
                                  }}
                                />
                              </IconContext.Provider>
                            </Col>

                            <Col className="text-right" sm={0.5}>
                              {this.state.actions.length !== 1 && (
                                <DeleteModal
                                  deleteCommand={this.handleDeleteAction}
                                  command={index}
                                />
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

          {this.state.selected && (
            <Container fluid className="mt-5">
              <Row>
                <Col md={{ span: 1 }}>
                  <Button
                    disabled={this.state.saving}
                    className="btn btn-primary rounded ml-2"
                    onClick={!this.state.saving ? this.saveActions : null}
                  >
                    {this.state.saving ? "Saving..." : "Save"}
                  </Button>
                </Col>
                <Col md={{ span: 1 }}>
                  <Button className="btn btn-primary rounded ml-2">Test</Button>
                </Col>
                <Col md={{ span: 2, offset: 8 }}>
                  <Button disabled className="btn btn-dark rounded mr-5">
                    Make Lesson
                  </Button>
                </Col>
              </Row>
            </Container>
          )}
        </Card.Body>
      </Card>
    );
  }
}
