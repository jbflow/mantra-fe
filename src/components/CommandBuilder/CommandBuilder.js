import React, { Component, Fragment } from "react";
import "../../styles/App.css";
import Commands from "./Commands";
import Actions from "./Actions";

export default class CommandBuilder extends Component {
  constructor(props) {
    super(props);
    const { ws, getConfig } = props;
    this.state = { selected: null };
  }

  updateSelected = (command) => {
    this.setState({ selected: command });
  };

  render() {
    return (
      <Fragment>
        <div className="rowC">
          <div style={{ height: "100vh", width: "600px", margin: "10px" }}>
            <Commands updateSelected={this.updateSelected} />
          </div>

          <div style={{ width: "100%", margin: "10px" }}>
            <Actions selected={this.state.selected} />
          </div>
        </div>
      </Fragment>
    );
  }
}
