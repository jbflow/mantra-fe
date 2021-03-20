import React, { useEffect, useState } from "react";
import { DragDropContext, Droppable, Draggable } from "react-beautiful-dnd";
import { GrDrag, GrDuplicate, GrAddCircle } from "react-icons/gr";
import { IconContext } from "react-icons";
import { Container, Card, Row, Col, Form, Button } from "react-bootstrap";
import { API } from "aws-amplify";
import DeleteModal from "./DeleteModal";

export default function Actions({ userId, selected: propSelected }) {
  const [actions, setActions] = useState([]);
  const [selected, setSelected] = useState(null);
  const [command, setCommand] = useState(null);
  const [saving, setSaving] = useState(null);

  useEffect(() => {
    API.get("talkbackBE", "/commands?userId=" + userId).then((res) => {
      res.forEach((command) => {
        if (command.id === propSelected) {
          setCommand(command.command);
          setActions(command.actions);
          setSelected(propSelected);
        }
      });
    });
  }, [userId, propSelected]);

  const onChange = (event, index) => {
    const newActions = [...actions];
    newActions[index] = event.target.value;
    setActions(newActions);
  };

  const handleAddAction = () => {
    setActions([...actions, ""]);
  };

  const handleDeleteAction = (index) => {
    const newActions = [...actions];
    newActions.splice(index, 1);
    setActions(newActions);
  };

  const handleDuplicateAction = (index) => {
    const newActions = [...actions];
    const action = newActions[index];
    newActions.splice(index, 0, action);
    setActions(newActions);
  };

  const saveActions = () => {
    setSaving(true);
    API.patch(
      "talkbackBE",
      "/commands?userId=" +
      userId +
      "&commandId=" +
      selected +
      "&patching=actions",
      { body: actions }
    ).then(() => {
      setSaving(false);
    });
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

  return (
    <Card className="ml-4 mt-3 border-0 h-100 " bg={"light"} text={"dark"}>
      <div className=" bg-white p-4">
        <Card.Header className="text-primary font-weight-bold bg-white border-bottom p-0">
          {command}
          <br />
          {command && (
            <>
              <p className="text-secondary font-weight-light small">Actions</p>
              {/* <p className="text-secondary font-weight-light small">Last Edited:</p> */}
            </>
          )}
        </Card.Header>
      </div>
      <Card.Body className="bg-white h-100 ">
        <DragDropContext onDragEnd={handleOneDragEnd}>
          <Droppable droppableId="actions" >
            {(provided) => (
              <Container
                className="p-0"
                fluid
                {...provided.droppableProps}
                ref={provided.innerRef}
              >
                {actions.map((action, index) => {
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
                          className="border border-dark mt-2 ml-2 mr-2 p-2 text-right actionItem justify-content-between"
                        >
                          <Col sm={8}>
                            <div className="d-flex justify-content-start">
                              <Col
                                className="pt-1"
                                sm={0.5}
                                {...provided.dragHandleProps}
                              >
                                <IconContext.Provider
                                  value={{
                                    style: {
                                      // fontSize: "30px",
                                      transform: 'rotate(-90deg)'
                                    },
                                  }}
                                >
                                  <GrDrag />
                                </IconContext.Provider>
                              </Col>
                              <Col sm={6}>
                                <Form.Control
                                  plaintext
                                  value={action}
                                  name="action"
                                  className="form-control"
                                  placeholder="Enter voice action..."
                                  onChange={(event) => onChange(event, index)}
                                />
                              </Col>
                            </div>
                          </Col>

                          <Col sm={2}>
                            <div className="d-flex justify-content-end">
                              <Col className="pt-1 mr-3 text-right" sm={1}>
                                {actions.length - 1 === index && (
                                  <IconContext.Provider
                                    value={{
                                      style: {
                                        fontSize: "20px",
                                        cursor: "pointer",
                                      },
                                    }}
                                  >
                                    <GrAddCircle onClick={handleAddAction} />
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
                                      handleDuplicateAction(index);
                                    }}
                                  />
                                </IconContext.Provider>
                              </Col>

                              <Col className="text-right" sm={0.5}>
                                {actions.length !== 1 && (
                                  <DeleteModal
                                    deleteCommand={handleDeleteAction}
                                    command={index}
                                    deleting={false}
                                  />
                                )}
                              </Col>
                            </div>
                          </Col>
                        </Form.Group>
                      )}
                    </Draggable>
                  );
                })}

                {provided.placeholder}
              </Container>
            )
            }
          </Droppable>
        </DragDropContext>

        {selected && (
          <Container fluid className="mt-5">
            <Row>
              <Col md={{ span: 1 }}>
                <Button
                  disabled={saving}
                  className="btn btn-primary rounded ml-2 text-center"
                  onClick={!saving ? saveActions : null}
                >
                  {saving ? "Saving..." : "Save"}
                </Button>
              </Col>
              <Col md={{ span: 1 }}>
                <Button className="btn btn-primary rounded ml-2 text-center">
                  Test
                </Button>
              </Col>
              <Col md={{ span: 2, offset: 8 }}>
                <Button
                  disabled
                  className="btn btn-dark rounded mr-5 text-center"
                >
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
