import React, { Component, Fragment } from "react";
import "../styles/App.css";

export default class BetaArea extends Component {
  render() {
    return (
      <div className="jumbotron" style={{ margin: "20px", aligh: "center" }}>
        <h1 className="display-3">Welcome, to the TalkBack Beta Programme!</h1>
        <br />
        <p className="lead">
          Please watch the video below for further instruction on setup and
          usage, then use the form at the bottom of this page to submit bug
          reports and feature requests.
        </p>
        <hr className="my-4" />
        <p>Thank you for your participation!</p>
        <p className="lead"></p>
      </div>
    );
  }
}
