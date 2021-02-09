import React, { Fragment } from "react";

import { API } from "aws-amplify";

import { GrFormTrash, GrFormClose } from "react-icons/gr";
import { MdDone } from "react-icons/md";
import { IconContext } from "react-icons";

import { Container, Row, Col, Form } from "react-bootstrap";

const classNames = require("classnames");

export default class Commands extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      userId: "1",
      showCreate: true,
      rows: [],
      editing: null,
      selected: null,
    };
  }

  componentDidMount() {
    this.getCommands();
  }

  createCommand = () => {
    this.exclusiveEdit();
    this.setState({ showCreate: false });
    this.setState({ selected: null });
  };

  editCommand = (id) => {
    this.exclusiveEdit();
    this.setState({ [id]: false });
    this.setState({ editing: id });
  };

  exclusiveEdit = () => {
    const stateCopy = { ...this.state };
    const stateKeys = Object.keys(stateCopy);
    for (var s = 0; s < stateKeys.length; s++) {
      if (stateCopy[stateKeys[s]] === false) {
        stateCopy[stateKeys[s]] = true;
      }
    }
    this.setState(stateCopy);
  };

  handleFocus = (event) => event.target.select();

  handleAddRow = (e) => {
    e.preventDefault();
    const command = { command: this.commandInput.value, actions: [""] };
    if (!this.state[command]) {
      this.setState({ showCreate: true });
      this.setState({ [command.id]: true });
      this.setState({ rows: [...this.state.rows, command] });
      this.postCommand(this.commandInput.value);
    } else {
      alert("Command already taken");
    }
  };

  handleEditRow = (command) => {
    const newRows = [...this.state.rows];
    const newCommand = this.editedInput.value;
    var index = newRows.indexOf(command);
    if (index !== -1) {
      newRows[index].command = newCommand;
    }
    this.setState({ rows: newRows });
    this.setState({ [command.id]: true });
    delete this.state[command];
    API.patch(
      "talkbackBE",
      "/commands?userId=" +
        this.state.userId +
        "&commandId=" +
        command.id +
        "&patching=command",
      {
        body: [newCommand],
      }
    );
  };

  handleSelection = (selection) => {
    this.exclusiveEdit();
    this.setState({ selected: selection });
    this.props.updateSelected(selection);
  };

  handleDeleteRow = (command) => {
    const newRows = [...this.state.rows];
    const index = newRows.indexOf(command);
    newRows.splice(index, 1);
    this.setState({ rows: newRows });
    delete this.state[command.id];
    this.deleteCommand(command.id);
  };

  handleCancelEdit = (id) => {
    this.setState({ [id]: true });
  };

  handleCancelCreate = () => {
    this.setState({ showCreate: true });
  };

  postCommand = (command) => {
    const emptyCommand = {
      command: command,
      actions: [""],
    };

    API.patch("talkbackBE", "/commands?userId=" + this.state.userId, {
      body: emptyCommand,
    });
  };

  deleteCommand = (id) => {
    API.del(
      "talkbackBE",
      "/commands?userId=" + this.state.userId + "&commandId=" + id
    );
  };

  getCommands = () => {
    API.get("talkbackBE", "/commands?userId=" + this.state.userId).then(
      (res) => {
        console.log("res: ", res);
        res.forEach((command) => {
          this.setState({ [command.id]: true });
          this.setState({ rows: [...this.state.rows, command] });
        });
      }
    );
  };

  render() {
    return (
      <>
        <Container className="h-75 pre-scrollable">
          {this.state.rows.map((command) => (
            <Form
              key={command.id}
              onSubmit={(e) => {
                e.preventDefault();
                this.handleEditRow(command);
              }}
            >
              <Form.Group
                as={Row}
                className={classNames(
                  {
                    "border rounded-pill border-secondary mt-2 ml-2 mr-2":
                      this.state.selected !== command.id,
                  },
                  {
                    "border rounded-pill border-secondary bg-light mt-2 ml-3 mr-1 all-3s":
                      this.state.selected === command.id,
                  }
                )}
              >
                {this.state[command.id] ? (
                  <>
                    <Col sm={10}>
                      <Form.Control
                        plaintext
                        readOnly
                        defaultValue={command.command}
                        className="btn btn-outline"
                        onDoubleClick={() => this.editCommand(command.id)}
                        onClick={() => this.handleSelection(command.id)}
                      />
                    </Col>
                    <Col sm={2} className="text-right mt-1">
                      <IconContext.Provider
                        value={{
                          style: {
                            fontSize: "30px",
                            cursor: "pointer",
                          },
                        }}
                      >
                        <GrFormTrash
                          onClick={() => this.handleDeleteRow(command)}
                        />
                      </IconContext.Provider>
                    </Col>
                  </>
                ) : (
                  <>
                    <Col sm={9}>
                      <Form.Control
                        plaintext
                        defaultValue={command.command}
                        className="form-control-commands pl-3"
                        ref={(input) => {
                          this.editedInput = input;
                        }}
                      />
                    </Col>
                    <Col sm={1} className="mt-1">
                      <IconContext.Provider
                        value={{
                          style: { fontSize: "30px", cursor: "pointer" },
                        }}
                      >
                        <MdDone onClick={() => this.handleEditRow(command)} />
                      </IconContext.Provider>
                    </Col>
                    <Col sm={2} className="text-right mt-1">
                      <IconContext.Provider
                        value={{
                          style: { fontSize: "30px", cursor: "pointer" },
                        }}
                      >
                        <GrFormClose
                          onClick={() => this.handleCancelEdit(command.id)}
                        />
                      </IconContext.Provider>
                    </Col>
                  </>
                )}
              </Form.Group>
            </Form>
          ))}
        </Container>
        <Container className="h-25 p-1 bg-secondary rounded-top">
          <Form onSubmit={this.handleAddRow}>
            <Form.Group
              as={Row}
              className="border rounded-pill border-secondary ml-2 mt-3 mr-4 bg-light"
            >
              {this.state.showCreate ? (
                <Col sm={10}>
                  <Form.Control
                    className="form-control-commands"
                    type="text"
                    plaintext
                    readOnly
                    placeholder="Click here to add command..."
                    onClick={this.createCommand}
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
                        this.commandInput = input;
                      }}
                    />
                  </Col>

                  <Col sm={2} className="mt-1">
                    <IconContext.Provider
                      value={{ style: { fontSize: "30px" } }}
                    >
                      <GrFormClose onClick={this.handleCancelCreate} />
                    </IconContext.Provider>
                  </Col>
                </>
              )}
            </Form.Group>
          </Form>
        </Container>
      </>
    );
  }
}
