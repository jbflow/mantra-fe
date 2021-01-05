import React, { Component } from "react";
import axios from "axios";
import { HTTP_API_URL } from "../utils/Constants";

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
    axios.get(HTTP_API_URL).then((res) => {
      res.data.forEach((obj) => {
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
    const { verb, noun1, adj1, noun2, adj2, noun3, adj3, adverb } = actions[
      index
    ];
    actions.splice(index, 0, "");
    this.setState({ actions: actions });
  };

  saveActions = () => {
    const updatedAction = {
      command: this.state.selected,
      actions: this.state.actions,
    };
    console.log(updatedAction);
    axios.post(HTTP_API_URL, updatedAction);
  };

  render() {
    return (
      <div className="card border-primary mb-3">
        <div className="card-header">Actions</div>
        <div className="card-body">
          <table>
            <tbody>
              {this.state.actions.map((action, index) => (
                <tr className="table table-sm" key={index}>
                  <td>
                    <input
                      type="text"
                      value={action}
                      name="action"
                      className="form-control"
                      placeholder="Enter voice action..."
                      onChange={(event) => this.onChange(event, index)}
                    ></input>
                  </td>

                  <td style={{ width: "5%" }}>
                    {this.state.actions.length !== 1 && (
                      <button
                        className="btn btn-sm btn-outline-danger"
                        onClick={() => {
                          this.handleDeleteAction(index);
                        }}
                      >
                        Remove
                      </button>
                    )}
                  </td>

                  <td style={{ width: "5%" }}>
                    <button
                      className="btn btn-sm btn-outline-primary"
                      onClick={() => {
                        this.handleDuplicateAction(index);
                      }}
                    >
                      Duplicate
                    </button>
                  </td>

                  <td style={{ width: "5%" }}>
                    {this.state.actions.length - 1 === index && (
                      <button
                        className="btn btn-sm btn-outline-success"
                        onClick={() => {
                          this.handleAddAction();
                        }}
                      >
                        Add
                      </button>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>

          {this.state.selected && (
            <div className="modal-footer">
              <button
                style={{ width: "15%" }}
                type="button"
                className="btn btn-lg btn-primary"
                onClick={() => {
                  this.saveActions();
                }}
              >
                Save
              </button>

              <button
                style={{ width: "15%" }}
                type="button"
                className="btn btn-lg btn-primary"
                onClick={() => {
                  console.log("test");
                }}
              >
                Test
              </button>
            </div>
          )}
        </div>
      </div>
    );
  }
}
