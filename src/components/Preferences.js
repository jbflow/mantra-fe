import React, { Component, Fragment } from "react";
import "../styles/App.css";

export default class Preferences extends Component {
  render() {
    return (
      <Fragment>
        <div
          className="card border-primary mb-3"
          style={{ height: "250px", margin: "10px" }}
        >
          <div className="card-header">Interface</div>
          <div className="card-body">
            <h4 className="card-title">
              Preferences that control how talkbak looks and feels
            </h4>
            <p className="card-text"></p>
          </div>
        </div>

        <div
          className="card border-primary mb-3"
          style={{ height: "250px", margin: "10px" }}
        >
          <div className="card-header">Operation</div>
          <div className="card-body">
            <h4 className="card-title">
              Preferences that control how talkback works, speech recognition,
              voice feedback, MIDI and audio setup etc.
            </h4>
            <p className="card-text"></p>
          </div>
        </div>

        <div
          className="card border-primary mb-3"
          style={{ height: "250px", margin: "10px" }}
        >
          <div className="card-header">Intent Detection</div>
          <div className="card-body">
            <h4 className="card-title">
              Preferences that affect the intent detection engine, defaults etc
            </h4>
            <p className="card-text"></p>
          </div>
        </div>
      </Fragment>
    );
  }
}
