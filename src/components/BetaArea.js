import { API } from "aws-amplify";
import React, { Fragment, useState } from "react";
import "../styles/App.css";

export default function BetaArea({ ws, getConfig }) {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const sendIntent = () => {
    const transcript = document.getElementById("intent_test").value;
    ws.send(
      JSON.stringify({
        message: transcript,
        action: "command",
        config: getConfig(),
        userId: localStorage.getItem("userId"),
      })
    );
  };

  const submitReport = () => {
    console.log(isSubmitting);
    setIsSubmitting(true);

    const message = document.getElementById("betaMessage").value;
    API.post("talkbackBE", "/beta", { body: { message: message } }).then(
      setIsSubmitting(false)
    );
  };

  return (
    <Fragment>
      <div className="jumbotron" style={{ margin: "20px", aligh: "center" }}>
        <h1 className="display-3">
          Welcome, to the TalkBack Alpha Tesing Phase!
        </h1>
        <br />
        <p className="lead">
          <a
            href="https://drive.google.com/file/d/1xr2t5wNLBjC-9tWSFxbV-Y1lGxnrAW9K/view?usp=sharing"
            target="_blank"
            rel="noreferrer"
          >
            Click here to watch set up and usage instruction video
          </a>
        </p>
        <hr className="my-4" />

        <p className="lead">
          <a
            href="https://drive.google.com/file/d/1D3u5vMaxHMSRn-obTuVJPoeEEQvFMOdi/view?usp=sharing"
            target="_blank"
            rel="noreferrer"
          >
            Click here to download the Ableton Remote Script.
          </a>
        </p>

        <p className="lead">
          Use the input below to quickly test the intent detection without using
          speech input.
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
                  onClick={sendIntent}
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
          onClick={submitReport}
          type="button"
          className="btn btn-outline-primary"
          style={{ width: "10%" }}
          disabled={isSubmitting}
        >
          {isSubmitting ? "Submitting..." : "Submit"}
        </button>
        <br />
        <br />
        <p>Thank you for your participation!</p>
      </div>
    </Fragment>
  );
}
