const isLocal = false// window.location.hostname === "localhost"
export const WEBSOCKET_API_URL =
    isLocal ?
        "ws://localhost:3001" :
        "wss://b6ot8bzgl7.execute-api.eu-west-2.amazonaws.com/dev";
console.log('window.location.hostname ', window.location.hostname);
export const HTTP_API_URL =
    isLocal ?
        "http://localhost:3000/dev/commands/" :
        "https://45zroonu95.execute-api.eu-west-2.amazonaws.com/dev/commands";