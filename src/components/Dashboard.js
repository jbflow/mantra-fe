import React, { Component, Fragment } from "react";
import "../styles/App.css";

export default class Dashboard extends Component {
  render() {
    return (
      <div className="rowC">
        <div
          className="card border-primary mb-3"
          style={{ height: "600px", width: "400px", margin: "10px" }}
        >
          <div className="card-header">User Profile</div>
          <div className="card-body">
            <h4 className="card-title">
              User details and Account settings links go here
            </h4>
            <p className="card-text"></p>
          </div>
        </div>

        <div
          className="card border-primary mb-3"
          style={{ height: "600px", width: "100%", margin: "10px" }}
        >
          <div className="card-header">Config Data</div>
          <div className="card-body">
            <h4 className="card-title">
              DAW Project Config and Usage data shows here!
            </h4>
            <p className="card-text"></p>
          </div>
        </div>
      </div>
    );
  }
}
