import React, { Component, Fragment } from "react";
import MIDIComponent from "./MIDIComponent";
import SpeechComponent from "./SpeechComponent";
import { WEBSOCKET_API_URL } from "./utils/Constants";

export default class Socket extends Component {
  constructor(props) {
    super(props);

    this.state = {
      ws: null,
      midi: null,
    };
  }

  componentDidMount() {
    this.connect();
  }

  timeout = 250;

  /**
   * @function connect
   * This function establishes the connect with the websocket and also ensures constant reconnection if connection closes
   */
  connect = () => {
    var ws = new WebSocket(WEBSOCKET_API_URL);
    let that = this; // cache the this
    var connectInterval;

    // websocket onopen event listener
    ws.onopen = () => {
      this.setState({ ws: ws });
      that.timeout = 250; // reset timer to 250 on open of websocket connection
      clearTimeout(connectInterval); // clear Interval on on open of websocket connection
    };

    ws.onmessage = (e) => {
      const data = JSON.parse(e.data);
      var midi = data["command"];
      this.setState({ midi: midi });
    };

    // websocket onclose event listener
    ws.onclose = (e) => {
      console.log(
        `Socket is closed. Reconnect will be attempted in ${Math.min(
          10000 / 1000,
          (that.timeout + that.timeout) / 1000
        )} second.`,
        e.reason
      );

      that.timeout = that.timeout + that.timeout; //increment retry interval
      connectInterval = setTimeout(this.check, Math.min(10000, that.timeout)); //call check function after timeout
    };

    // websocket onerror event listener
    ws.onerror = (err) => {
      console.error(
        "Socket encountered error: ",
        err.message,
        "Closing socket"
      );

      ws.close();
    };
  };

  /**
   * utilited by the @function connect to check if the connection is close, if so attempts to reconnect
   */
  check = () => {
    const { ws } = this.state;
    if (!ws || ws.readyState === WebSocket.CLOSED) this.connect(); //check if websocket instance is closed, if so call `connect` function.
  };

  render() {
    const { ws, midi } = this.state;
    return (
      <Fragment>
        <MIDIComponent websocket={ws} midi={midi} />
        <SpeechComponent websocket={ws} />
      </Fragment>
    );
  }
}
