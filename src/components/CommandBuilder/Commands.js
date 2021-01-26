import React, { Fragment } from "react";
import axios from "axios";
import { HTTP_API_URL } from "../../utils/Constants";
import { GrFormTrash, GrFormClose } from "react-icons/gr";
import { MdDone } from "react-icons/md";
import { IconContext } from "react-icons";

import { Container, Row, Col, Button, Table, Form } from "react-bootstrap";

export default class Commands extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
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

  editCommand = (command) => {
    this.exclusiveEdit();
    this.setState({ [command]: false });
    this.setState({ editing: command });
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
    const command = this.commandInput.value;
    if (!this.state[command]) {
      this.setState({ showCreate: true });
      this.setState({ [command]: true });
      this.setState({ rows: [...this.state.rows, command] });
      this.postCommand(command);
    } else {
      alert("Command already taken");
    }
  };

  handleEditRow = (e) => {
    console.table(e);
    e.preventDefault();
    const newRows = [...this.state.rows];
    const oldCommand = this.state.editing;
    const command = this.editedInput.value;
    var index = newRows.indexOf(oldCommand);
    if (index !== -1) {
      newRows[index] = command;
    }
    this.setState({ rows: newRows });
    this.setState({ [command]: true });
    delete this.state[oldCommand];

    axios.get(HTTP_API_URL + "/commands").then((res) => {
      res.data.forEach((obj) => {
        if (obj.command === this.state.editing) {
          obj.command = command;
          axios.put(HTTP_API_URL + "/commands" + obj.id + "/", obj); // NEEDS FIXING
        }
      });
    });
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
    delete this.state[command];
    this.deleteCommand(command);
  };

  handleCancelEdit = (command) => {
    this.setState({ [command]: true });
  };

  handleCancelCreate = () => {
    this.setState({ showCreate: true });
  };

  postCommand = (command) => {
    const emptyCommand = {
      command: command,
      actions: [""],
    };

    axios.post(HTTP_API_URL + "/commands", emptyCommand);
  };

  deleteCommand = (command) => {
    console.log(command);
    axios.delete(HTTP_API_URL + "/commands" + "?command=" + command);
  };

  getCommands = () => {
    axios.get(HTTP_API_URL + "/commands").then((res) => {
      res.data.forEach((action) => {
        this.setState({ [action.command]: true });
        this.setState({ rows: [...this.state.rows, action.command] });
      });
    });
  };

  render() {
    return (
      <>
        <Container className="min-vh-80 pre-scrollable">
          {this.state.rows.map((command) => (
            <Form onSubmit={this.handleEditRow}>
              <Form.Group
                onMouseOver={() => {}}
                as={Row}
                className="border rounded-pill border-secondary mt-3 ml-2 mr-1 bg-light"
              >
                {this.state[command] ? (
                  <>
                    <Col sm={10}>
                      <Form.Control
                        plaintext
                        readOnly
                        defaultValue={command}
                        className="form-control-commands"
                        onDoubleClick={() => this.editCommand(command)}
                        onClick={() => this.handleSelection(command)}
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
                        defaultValue={command}
                        className="form-control-commands"
                        ref={(input) => {
                          this.commandInput = input;
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
                          onClick={() => this.handleCancelEdit(command)}
                        />
                      </IconContext.Provider>
                    </Col>
                  </>
                )}
              </Form.Group>
            </Form>
          ))}
        </Container>
        <Container>
          <Form onSubmit={this.handleAddRow}>
            <Form.Group
              as={Row}
              className="border rounded-pill border-secondary ml-2 mr-3 bg-light"
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
