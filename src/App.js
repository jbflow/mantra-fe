import './App.css';
import ReconnectingWebSocket from 'reconnecting-websocket';
import { useEffect, useState } from 'react';

const WS_URL = "ws://localhost:3001";
// const WS_URL = "wss://qe73m358t4.execute-api.eu-west-2.amazonaws.com/dev";

const username = "user-" + Math.floor(Math.random() * 100000)
console.log('username: ', username);

function App() {
  const [socket, setSocket] = useState(null);
  const [inputValue, setInputValue] = useState('');
  const [messages, setMessages] = useState([{ username: "default", content: "nomessage" }]);

  function postMessage(event) {
    event.preventDefault();
    const data = { "action": "sendMessage", "username": username, "content": inputValue };
    socket.send(JSON.stringify(data));
  }
  const handleMessageChange = ({ target }) => {
    setInputValue(target.value);
  }
  const setupWebSocket = () => {
    const websocket = new ReconnectingWebSocket(WS_URL);
    setSocket(websocket);
    console.log('websocket: ', websocket);
    websocket.onopen = function (event) {
      const data = { "action": "getRecentMessages" };
      websocket.send(JSON.stringify(data));
    };
    websocket.onclose = function (event) {
      console.log('onclose event: ', event);
    };
    websocket.onmessage = function (message) {
      var data = JSON.parse(message.data);
      setMessages((messages => messages.concat(data.messages)));
    };
  }
  useEffect(() => {
    if (!socket) setupWebSocket();
  })

  return (
    <div className="App">
      <div id="main-wrapper" className="wrapper">
        <div id="header-bar" className="jumbotron text-center">
          <h1 id="header-text-first">Welcome to the</h1><h1>Serverless Chatroom</h1>
          <p>Catch up on the conversation below!</p>
        </div>
        <div id="main-container">
          <div id="message-container" className="row col-lg-12">
            <div id="empty-message" className="message">{messages.map((message) => (
              <p>{message?.username}: {message?.content}</p>
            ))}</div>
          </div>
        </div>
        <div id="footer-container">
          <form onSubmit={postMessage} id="post-container" className="card-header form-inline row col-lg-12">
            <i id="comments-icon" className="fas fa-comments" aria-hidden="true"></i>
            <input
              id="post-bar"
              type="text"
              className="form-control"
              placeholder="Write a Message!"
              maxLength="70"
              value={inputValue}
              onChange={handleMessageChange}
            />
            <button id="post-btn" className="btn btn-primary">Post</button>
          </form>
        </div>
      </div>
    </div>
  );
}

export default App;
