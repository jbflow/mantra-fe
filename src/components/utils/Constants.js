export const WEBSOCKET_API_URL = "ws://localhost:3001";
console.log('window.location.hostname ', window.location.hostname);
export const HTTP_API_URL =
	window.location.hostname === "localhost" ?
		"http://localhost:3000/dev/commands/" :
		"https://h5l6efw5li.execute-api.eu-west-2.amazonaws.com/dev/commands";
