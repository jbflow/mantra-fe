import Axios from "axios";
import React, { Component, Fragment } from "react";
import "../styles/App.css";
import { HTTP_API_URL } from "../utils/Constants";

export default class BetaArea extends Component {
  sendIntent = () => {
    const transcript = document.getElementById("intent_test").value;
    const websocket = this.props.ws;
    const config = this.props.getConfig();
    websocket.send(
      JSON.stringify({
        message: transcript,
        action: "command",
        config: config,
      })
    );
  };

  submitReport = () => {
    const message = document.getElementById("betaMessage").value;
    Axios.post(HTTP_API_URL + "/beta", { message: message });
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
            usage.
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
                    onClick={this.sendIntent}
                    type="button"
                    className="btn btn-outline-primary"
                  >
                    Test
                  </button>
                </td>
              </tr>
            </tbody>
          </table>
          <p className="lead">
            Please use this form to submit bug reports and feature requests.
          </p>

          <div className="form-group" style={{ width: "50%" }}>
            <textarea
              className="form-control"
              id="betaMessage"
              rows="3"
            ></textarea>
          </div>

          <button
            onClick={this.submitReport}
            type="button"
            className="btn btn-outline-primary"
            style={{ width: "10%" }}
          >
            Submit
          </button>
          <br />
          <br />
          <p>Thank you for your participation!</p>
        </div>
      </Fragment>
    );
  }
}
