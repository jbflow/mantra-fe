const isLocal = window.location.hostname === "localhost";
export const WEBSOCKET_API_URL = isLocal
  ? "ws://localhost:3001"
  : "wss://5cxemporq7.execute-api.eu-west-2.amazonaws.com/dev";
console.log("window.location.hostname ", window.location.hostname);
export const HTTP_API_URL = isLocal
  ? "http://localhost:3000/dev"
  : "https://0pejn93ltg.execute-api.eu-west-2.amazonaws.com/dev";
