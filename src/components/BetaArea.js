import React, { Component, Fragment } from "react";
import "../styles/App.css";

export default class BetaArea extends Component {
  send_intent = () => {
    const transcript = document.getElementById("intent_test").value;
    const websocket = this.props.ws;
    const config = this.props.getConfig()
    console.log(transcript, config);
    websocket.send(
      JSON.stringify({
        message: transcript,
        action: "command",
        config: config,
      })
    );
  };
  
  render() {
    return (
      <Fragment>
        <div className="jumbotron" style={{ margin: "20px", aligh: "center" }}>
          <h1 className="display-3">
            Welcome, to the TalkBack Beta Programme!
          </h1>
          <br />
          <p className="lead">
            Please watch the video below for further instruction on setup and
            usage, then use the form at the bottom of this page to submit bug
            reports and feature requests.
          </p>
          <hr className="my-4" />

          <p className="lead">
            Use the input below to quickly test the intent detection without
            using speech input.
          </p>
          <table className="table table-sm" style={{ width: "400px" }}>
            <tbody>
              <tr>
                <td>
                  <input
                    type="text"
                    className="form-control"
                    placeholder="Type command to test"
                    id="intent_test"
                  />
                </td>
                <td style={{ width: "20%" }}>
                  <button
                    onClick={this.send_intent}
                    onKeyDown={this.send_intent}
                    type="button"
                    className="btn btn-outline-primary"
                  >
                    Test
                  </button>
                </td>
              </tr>
            </tbody>
          </table>
          <br />
          <p>Thank you for your participation!</p>
        </div>
      </Fragment>
    );
  }
}
