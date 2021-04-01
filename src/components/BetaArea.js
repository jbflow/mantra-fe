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
          Welcome, to the TalkBack testing page!
        </h1>
        

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
        <iframe
          src="https://docs.google.com/forms/d/e/1FAIpQLSecPQTHl6PT84t-d5FyrdQ_bvV0P_zYrPyg2ay1W_yKDP3DtA/viewform?embedded=true"
          width="640"
          height="849"
          frameborder="0"
          marginheight="0"
          marginwidth="0"
        >
          Loading…
        </iframe>

        <p>Thank you for your participation!</p>
      </div>
    </Fragment>
  );
}
