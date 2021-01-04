import React, { Component, Fragment } from "react";
import "../styles/App.css";

export default class LessonBuilder extends Component {
  render() {
    return (
      <div className="rowC">
        <div
          className="card border-primary mb-3"
          style={{ height: "600px", width: "600px", margin: "10px" }}
        >
          <div className="card-header">Lessons</div>
          <div className="card-body">
            <h4 className="card-title">List of lessons goes here</h4>
            <p className="card-text"></p>
          </div>
        </div>

        <div
          className="card border-primary mb-3"
          style={{ height: "600px", width: "100%", margin: "10px" }}
        >
          <div className="card-header">Actions and Instructions</div>
          <div className="card-body">
            <h4 className="card-title">
              List of actions to be taken and spoken instruction for lessons
              goes here
            </h4>
            <p className="card-text"></p>
          </div>
        </div>
      </div>
    );
  }
}
