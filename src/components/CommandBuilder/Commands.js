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
    setCommands({
      ...commands,
      [command.id]: { ...command, isEditing: true },
    });
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
    console.log("edit row:", command);
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
      setCommands({
        ...commands,
        [command.id]: { ...command, isEditing: false },
      });
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
    setCommands({
      ...commands,
      [command.id]: { ...command, isEditing: false },
    });
    console.log("cancelEdit:", commands);
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
    await API.del(
      "talkbackBE",
      "/commands?userId=" + userId + "&commandId=" + command.id
    );
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
      <Container className="h-100 pre-scrollable">
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
              className={classNames(
                {
                  "border rounded-pill border-secondary mt-2 ml-2 mr-2":
                    selected !== command.id,
                },
                {
                  "border rounded-pill border-secondary bg-light mt-2 ml-3 mr-1 all-3s":
                    selected === command.id,
                }
              )}
            >
              {!command.isEditing ? (
                <>
                  <Col sm={10}>
                    <Form.Control
                      plaintext
                      readOnly
                      defaultValue={command.command}
                      className="btn btn-outline"
                      onDoubleClick={() => editCommand(command)}
                      onClick={() => handleSelection(command.id)}
                    />
                  </Col>
                  <Col sm={2} className="text-right mt-1">
                    <DeleteModal
                      deleteCommand={handleDeleteRow}
                      command={command}
                    />
                  </Col>
                </>
              ) : (
                <>
                  <Col sm={9}>
                    <Form.Control
                      plaintext
                      defaultValue={command.command}
                      className="form-control-commands pl-3"
                      ref={editedInput}
                    />
                  </Col>
                  <Col sm={1} className="mt-1">
                    <IconContext.Provider
                      value={{
                        style: { fontSize: "30px", cursor: "pointer" },
                      }}
                    >
                      <MdDone onClick={() => handleEditRow(command)} />
                    </IconContext.Provider>
                  </Col>
                  <Col sm={2} className="text-right mt-1">
                    <IconContext.Provider
                      value={{
                        style: { fontSize: "30px", cursor: "pointer" },
                      }}
                    >
                      <GrFormClose onClick={() => handleCancelEdit(command)} />
                    </IconContext.Provider>
                  </Col>
                </>
              )}
            </Form.Group>
          </Form>
        ))}
      </Container>
      <Container
        className="p-1 bg-secondary rounded-top"
        style={{
          zIndex: "1030",
          right: "0",
          bottom: "0",
          left: "0",
          position: "absolute",
        }}
      >
        <Form onSubmit={handleAddRow}>
          <Form.Group
            as={Row}
            className="border rounded-pill border-secondary ml-2 mt-3 mr-4 bg-light"
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
                <Col sm={10}>
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
