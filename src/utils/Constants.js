const isLocal = window.location.hostname === "localhost";
export const isDev = () => {
  const url = window.location.href.toString();
  if (
    url.slice(0, 30) === "https://dev.dbs-talkback.co.uk" ||
    url.slice(0, 21) === "http://localhost:3003"
  ) {
    return true;
  } else {
    return false;
  }
};
export const WEBSOCKET_API_URL = isLocal
  ? "ws://localhost:3001"
  : isDev()
  ? "wss://hocbp309ub.execute-api.eu-west-2.amazonaws.com/dev"
  : "wss://rxxv9vjrgf.execute-api.eu-west-2.amazonaws.com/prod";
console.log("window.location.hostname ", window.location.href);
export const HTTP_API_URL = isLocal
  ? "http://localhost:3000/dev"
  : isDev()
  ? "https://wr40l67rnb.execute-api.eu-west-2.amazonaws.com/dev"
  : "https://j4onope2hd.execute-api.eu-west-2.amazonaws.com/prod";
