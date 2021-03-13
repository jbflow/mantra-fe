import React, { useState, useEffect, useRef } from "react";
import { API } from "aws-amplify";
import { GrFormClose } from "react-icons/gr";
import { MdDone } from "react-icons/md";
import { IconContext } from "react-icons";
import { Container, Row, Col, Form, Spinner } from "react-bootstrap";
import DeleteModal from "./DeleteModal";
const classNames = require("classnames");

export default function Commands({ updateSelected, userId }) {
  const [showCreate, setShowCreate] = useState(null);
  const [commands, setCommands] = useState({});
  const [startup, setStartup] = useState(true);
  const [selected, setSelected] = useState(null);
  const [addingCommand, setAddingCommand] = useState(false);
  const [isEditing, setIsEditing] = useState(null);
  const [savingCommand, setSavingCommand] = useState(null);
  const [isDeleting, setIsDeleting] = useState(false);

  const editedInput = useRef(null);
  let commandInput = null;

  const createCommand = () => {
    exclusiveEdit();
    setShowCreate(false);
    setAddingCommand(false);
    setSelected(false);
  };

  const editCommand = (command) => {
    exclusiveEdit();
    setIsEditing(command.id);
  };

  const exclusiveEdit = () => {
    const stateCopy = { ...commands };
    const stateKeys = Object.keys(stateCopy);
    for (var s = 0; s < stateKeys.length; s++) {
      if (stateCopy[stateKeys[s]] === false) {
        stateCopy[stateKeys[s]] = true;
      }
    }
    setCommands(stateCopy);
  };

  const handleAddRow = (e) => {
    e.preventDefault();
    const command = commandInput.value;
    if (!commands[command]) {
      setShowCreate(true);
      postCommand(command);
    } else {
      alert("Command already taken");
    }
  };

  const handleEditRow = (command) => {
    setSavingCommand(command.id);
    const newName = editedInput.current.value;
    API.patch(
      "talkbackBE",
      "/commands?userId=" +
      userId +
      "&commandId=" +
      command.id +
      "&patching=command",
      {
        body: [newName],
      }
    ).then((res) => {
      setIsEditing(null);
      setSavingCommand(null);
      getCommands();
    });
  };

  const handleSelection = (selection) => {
    exclusiveEdit();
    setSelected(selection);
    updateSelected(selection);
  };

  const handleDeleteRow = (command) => {
    deleteCommand(command);
  };

  const handleCancelEdit = (command) => {
    setIsEditing(null);
    editedInput.current.value = command.command;
  };

  const handleCancelCreate = () => {
    setShowCreate(true);
  };

  const postCommand = (command) => {
    const emptyCommand = {
      command: command,
      actions: [""],
    };

    API.patch("talkbackBE", "/commands?userId=" + userId, {
      body: emptyCommand,
    }).then((res) => {
      getCommands();
      setAddingCommand(false);
      setShowCreate(true);
    });
  };

  const deleteCommand = async (command) => {
    setIsDeleting(true);
    await API.del(
      "talkbackBE",
      "/commands?userId=" + userId + "&commandId=" + command.id
    ).then(() => {
      setIsDeleting(false);
    });
    getCommands();
  };

  const getCommands = () => {
    API.get("talkbackBE", "/commands?userId=" + userId).then((res) => {
      const newCommands = {};
      res.forEach((cmd) => {
        newCommands[cmd.id] = cmd;
      });
      setCommands({
        ...newCommands,
      });
    });
  };

  useEffect(() => {
    if (startup) {
      API.get("talkbackBE", "/commands?userId=" + userId).then((res) => {
        const newCommands = {};
        res.forEach((cmd) => {
          newCommands[cmd.id] = cmd;
        });
        setCommands({
          ...newCommands,
        });
      });
      setStartup(false);
    }
  }, [startup, userId]);

  return (
    <>

      <Container style={{ paddingRight: 0, paddingLeft: 0 }}>
        {Object.entries(commands).map(([key, command]) => (
          <Form
            key={command.id}
            onSubmit={(e) => {
              e.preventDefault();
              handleEditRow(command);
            }}
          >
            <Form.Group
              as={Row}
              style={{
                margin: 0,
                borderTop: 0
              }}
              className={classNames(
                {
                  "border-bottom   ":
                    selected !== command.id,
                },
                {
                  "border-bottom   bg-light  all-3s":
                    selected === command.id,
                }
              )}
            >
              <>
                <Col sm={command.id !== isEditing ? 9 : 8}>
                  <Form.Control
                    plaintext
                    readOnly={command.id !== isEditing}
                    defaultValue={command.command}
                    className={
                      command.id !== isEditing
                        ? "btn btn-outline"
                        : "form-control-commands btn"
                    }
                    style={{
                      fontWeight: 700,
                      padding: 10
                    }}
                    onDoubleClick={() => editCommand(command)}
                    onClick={() => handleSelection(command.id)}
                    ref={command.id === isEditing ? editedInput : null}
                  />
                </Col>

                {isEditing !== command.id ? null : (
                  <Col sm={1} className="mt-1">
                    {savingCommand === command.id ? (
                      <Spinner size="sm" animation="border" role="status">
                        <span className="sr-only">Loading...</span>
                      </Spinner>
                    ) : (
                      <IconContext.Provider
                        value={{
                          style: { fontSize: "30px", cursor: "pointer" },
                        }}
                      >
                        <MdDone onClick={() => handleEditRow(command)} />
                      </IconContext.Provider>
                    )}
                  </Col>
                )}

                {isEditing !== command.id ? (
                  <Col sm={2} className="text-right mt-1">
                    <DeleteModal
                      deleteCommand={handleDeleteRow}
                      command={command}
                      isDeleting={isDeleting}
                    />
                  </Col>
                ) : (
                  <Col sm={2} className="text-right mt-1">
                    <IconContext.Provider
                      value={{
                        style: { fontSize: "30px", cursor: "pointer" },
                      }}
                    >
                      <GrFormClose onClick={() => handleCancelEdit(command)} />
                    </IconContext.Provider>
                  </Col>
                )}
              </>
            </Form.Group>
          </Form>
        ))}
      </Container>
      <Container
        className="border-top"
        style={{
          paddingRight: 0,
          paddingLeft: 0,
          position: 'absolute',
          bottom: 0

        }}

      >
        <Form onSubmit={handleAddRow}>
          <Form.Group
            as={Row}
            className="border ml-2 mt-3 mr-0 bg-light"
            style={{ borderRadius: '20px 0px 0px 20px' }}
          >
            {showCreate ? (
              <Col sm={10}>
                <Form.Control
                  className="form-control-commands"
                  type="text"
                  plaintext
                  readOnly
                  placeholder="Click here to add command..."
                  onClick={createCommand}
                />
              </Col>
            ) : (
              <>
                <Col sm={9}>
                  <Form.Control
                    className="form-control-commands"
                    type="text"
                    plaintext
                    placeholder="Type voice command..."
                    ref={(input) => {
                      commandInput = input;
                    }}
                  />
                </Col>

                {addingCommand ? (
                  <Col sm={2} className="mt-1">
                    <Spinner size="sm" animation="border" role="status">
                      <span className="sr-only">Loading...</span>
                    </Spinner>
                  </Col>
                ) : (
                  <Col sm={2} className="mt-1">
                    <IconContext.Provider
                      value={{ style: { fontSize: "30px" } }}
                    >
                      <GrFormClose onClick={handleCancelCreate} />
                    </IconContext.Provider>
                  </Col>
                )}
              </>
            )}
          </Form.Group>
        </Form>
      </Container>
    </>
  );
}
