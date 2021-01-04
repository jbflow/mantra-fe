export const WEBSOCKET_API_URL =
	window.location.hostname === "localhost" ?
		"wss://b6ot8bzgl7.execute-api.eu-west-2.amazonaws.com/dev" :
		"wss://b6ot8bzgl7.execute-api.eu-west-2.amazonaws.com/dev";
console.log('window.location.hostname ', window.location.hostname);
export const HTTP_API_URL =
	window.location.hostname === "localhost" ?
		"http://localhost:3000/dev/commands/" :
		"https://45zroonu95.execute-api.eu-west-2.amazonaws.com/dev/commands";
