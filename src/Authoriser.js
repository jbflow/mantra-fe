import { Auth } from "aws-amplify";
import { Card } from "react-bootstrap";
import { BrowserRouter } from "react-router-dom";
import config from "./amplify-config";
import App from "./App";
import useAuthentication from "./hooks/useAuthentication";
import { isDev } from "./utils/Constants";

// Hub.listen(/.*/, ({ channel, payload }) =>
//   console.debug(`[hub::${channel}::${payload.event}]`, payload)
// );
// https://aws-amplify.github.io/docs/js/authentication#manual-setup
Auth.configure({
  region: config.cognito.REGION,
  userPoolId: config.cognito.USER_POOL_ID,
  userPoolWebClientId: config.cognito.APP_CLIENT_ID,

  // Cognito Hosted UI configuration
  oauth: {
    domain: isDev()
      ? "devdbs-talkback.auth.eu-west-2.amazoncognito.com"
      : "dbs-talkback.auth.eu-west-2.amazoncognito.com",
    scope: [
      "phone",
      "email",
      "openid",
      "aws.cognito.signin.user.admin",
      "profile",
    ],
    redirectSignIn: `${document.location.origin}/callback`,
    redirectSignOut: `${document.location.origin}/signout`,
    userPoolId: config.cognito.USER_POOL_ID,
    responseType: "code",
  },
});

const Authoriser = () => {
  const {
    isAuthenticated,
    isLoading,
    // user,
    // error,
    // signIn,
    signOut,
    SignInButton,
  } = useAuthentication();
  return (
    !isLoading &&
    (isAuthenticated ? (
      <>
        <BrowserRouter>
          <App signOut={signOut} />
        </BrowserRouter>
      </>
    ) : (
      <>
        <div
          style={{
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            width: "100vw", // make sure the parent is full screen
            height: "80vh", // so that the content will center correctly
          }}
        >
          <Card style={{ width: "18rem" }}>
            <Card.Header>
              <p style={{ color: "#0069D9" }}>tlkbck</p>
            </Card.Header>
            <Card.Body>
              <Card.Title>Sign In</Card.Title>
              <Card.Text>
                New user? <a>Create an account</a>
              </Card.Text>
              <SignInButton style={{ float: "right" }} />
            </Card.Body>
          </Card>
        </div>
      </>
    ))
  );
};
export default Authoriser;
