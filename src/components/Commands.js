import React, { Fragment } from "react";
import axios from "axios";
import { HTTP_API_URL } from "../utils/Constants";
import { API } from 'aws-amplify';

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
    API.get("talkbackBE", "/commands").then((res) => {
      res.forEach((obj) => {
        if (obj.command === this.state.editing) {
          obj.command = command;
          API.put("talkbackBE", "/commands" + obj.id + "/", { body: obj }); // NEEDS FIXING
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
    API.post("talkbackBE", "/commands", { body: emptyCommand })
  };

  deleteCommand = (command) => {
    console.log(command);
    API.del("talkbackBE", "/commands?command=" + command);
  };

  getCommands = () => {
    API.get("talkbackBE", "/commands").then((res) => {
      console.log('res: ', res);
      res.forEach((action) => {
        this.setState({ [action.command]: true });
        this.setState({ rows: [...this.state.rows, action.command] });
      });
    });
  };

  render() {
    return (
      <div className="card border-primary mb-3">
        <div className="card-header">Commands</div>
        <div className="card-body">
          <table className="table table-sm table-light">
            <tbody>
              {this.state.rows.map((command) => (
                <tr key={command}>
                  {this.state[command] ? (
                    <Fragment>
                      <td
                        className={this.getSelected(command)}
                        onDoubleClick={() => this.editCommand(command)}
                        onClick={() => this.handleSelection(command)}
                      >
                        {command}
                      </td>
                      <td className="button-cell table-light">
                        <button
                          className="btn btn-sm btn-danger"
                          onClick={() => this.handleDeleteRow(command)}
                        >
                          Delete
                        </button>
                      </td>
                    </Fragment>
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
                </tr>
              ))}
              <tr>
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
              </tr>
            </tbody>
          </table>
        </div>
      </div>
    );
  }
}
