import React, { Fragment } from "react";
import axios from "axios";
import { HTTP_API_URL } from "../../utils/Constants";
import { GrFormTrash } from "react-icons/gr";
import { IconContext } from "react-icons";

import { Container, Row, Col, Table } from "react-bootstrap";

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

  getSelected = (command) => {
    if (this.state.selected === command) {
      return "table-primary";
    } else {
      return "table-light";
    }
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
      <Container className="border-right vh-100">
        {this.state.rows.map((command) => (
          <Row key={command}>
            {this.state[command] ? (
              <Table active striped bordered size="sm">
                <tbody>
                  <tr>
                    <td
                      className={this.getSelected(command)}
                      onDoubleClick={() => this.editCommand(command)}
                      onClick={() => this.handleSelection(command)}
                    >
                      {command}
                    </td>

                    <td className="w-25">
                      {/* <button
                    className="btn btn-sm btn-outline-danger"
                    onClick={() => this.handleDeleteRow(command)}
                  > */}
                      <IconContext.Provider
                        value={{ style: { fontSize: "30px" } }}
                      >
                        <GrFormTrash
                          onClick={() => this.handleDeleteRow(command)}
                        />
                      </IconContext.Provider>
                    </td>
                  </tr>
                </tbody>
              </Table>
            ) : (
              <Fragment>
                <td>
                  <form onSubmit={this.handleEditRow}>
                    <input
                      className="form-control-commands"
                      type="text"
                      autoFocus
                      defaultValue={command}
                      ref={(input) => {
                        this.editedInput = input;
                      }}
                      onFocus={this.handleFocus}
                    ></input>
                  </form>
                </td>
                <td className="button-cell">
                  <button
                    className="btn btn-sm btn-warning"
                    onClick={() => this.handleCancelEdit(command)}
                  >
                    Cancel
                  </button>
                </td>
              </Fragment>
            )}
          </Row>
        ))}
        <Row>
          {this.state.showCreate ? (
            <Fragment>
              <td className="table-light" onClick={this.createCommand}>
                Click here to add new voice command
              </td>
              <td className="button-cell" />
            </Fragment>
          ) : (
            <Fragment>
              <td>
                <form onSubmit={this.handleAddRow}>
                  <input
                    className="form-control-commands"
                    type="text"
                    autoFocus
                    placeholder="Type voice command..."
                    ref={(input) => {
                      this.commandInput = input;
                    }}
                  ></input>
                </form>
              </td>

              <td className="button-cell">
                <button
                  className="btn btn-sm btn-warning"
                  onClick={this.handleCancelCreate}
                >
                  Cancel
                </button>
              </td>
            </Fragment>
          )}
        </Row>
      </Container>
    );
  }
}
