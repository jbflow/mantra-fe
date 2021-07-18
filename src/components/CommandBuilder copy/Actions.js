import React, { useEffect, useState } from "react";
import { DragDropContext, Droppable, Draggable } from "react-beautiful-dnd";
import { GrDrag, GrAdd } from "react-icons/gr";
import { IoMdCopy } from "react-icons/io";
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
          <Droppable droppableId="actions">
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
                          className="border border-dark mt-2 ml-2 mr-2 p-0 text-right actionItem justify-content-between align-items-center"
                        >
                          <Col sm={8}>
                            <div className="d-flex justify-content-start ">
                              <Col
                                className="pt-2"
                                sm={0.5}
                                {...provided.dragHandleProps}
                              >
                                <IconContext.Provider
                                  value={{
                                    style: {
                                      // fontSize: "30px",
                                      transform: "rotate(-90deg)",
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

                          <Col sm={4} className="p-0">
                            <div
                              className="d-flex justify-content-end "
                              style={{ height: 50 }}
                            >
                              <Col
                                className="border-left svg-container"
                                sm={3}
                                style={{ height: 50 }}
                              >
                                <IconContext.Provider
                                  value={{
                                    style: {
                                      fontSize: "20px",
                                      cursor: "pointer",
                                    },
                                  }}
                                >
                                  <IoMdCopy
                                    onClick={() => {
                                      handleDuplicateAction(index);
                                    }}
                                  />
                                </IconContext.Provider>
                              </Col>

                              <Col className="border-left svg-container" sm={3}>
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
                <div className="svg-container addAction m-2">
                  <IconContext.Provider
                    value={{
                      style: {
                        fontSize: "20px",
                        cursor: "pointer",
                      },
                    }}
                  >
                    <GrAdd onClick={handleAddAction} />
                  </IconContext.Provider>
                </div>
              </Container>
            )}
          </Droppable>
        </DragDropContext>

        {selected && (
          <Container fluid className="mt-5 justify-content-between flex-row">
            <Row className="justify-content-between">
              <Col md={{ span: 6 }}>
                <Button
                  disabled={saving}
                  className="btn btn-primary rounded-more text-center"
                  onClick={!saving ? saveActions : null}
                >
                  {saving ? "Saving..." : "Save"}
                </Button>
                <Button className="btn btn-outline-primary rounded-more ml-2 text-center">
                  Test
                </Button>
              </Col>
              <Col
                md={{ span: 6 }}
                className="justify-content-end text-right p-0"
              >
                <Button
                  disabled
                  className="btn btn-outline-dark rounded-more text-center mr-1"
                >
                  Make Lesson
                </Button>
              </Col>
            </Row>
          </Container>
        )}
        <br />
        <br />
        <br />
        <br />
        <br />
        <br />
      </Card.Body>
    </Card>
  );
}
