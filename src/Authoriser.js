import { useEffect, useState } from "react";
import { Auth } from "aws-amplify";
import { Card } from "react-bootstrap";
import { BrowserRouter } from "react-router-dom";
import App from "./App";
import useAuthentication from "./hooks/useAuthentication";



import ContextComposer from "./contexts/ContextComposer";

require('dotenv').config()
console.log(process.env)



Auth.configure({
  region: process.env.REACT_APP_AMPLIFY_REGION,
  userPoolId: process.env.REACT_APP_AMPLIFY_USER_POOL_ID,
  userPoolWebClientId: process.env.REACT_APP_AMPLIFY_APP_CLIENT_ID,

  // Cognito Hosted UI configuration
  oauth: {
    domain: process.env.REACT_APP_COGNITO_DOMAIN,
    scope: [
      "phone",
      "email",
      "openid",
      "aws.cognito.signin.user.admin",
      "profile",
    ],
    redirectSignIn: `${document.location.origin}/callback`,
    redirectSignOut: `${document.location.origin}/signout`,
    userPoolId: process.env.REACT_APP_AMPLIFY_USER_POOL_ID,
    responseType: "code",
  },
});

const Authoriser = () => {
  const [paymentCreated, setPaymentCreated] = useState(null);
  const [checkingPayment, setCheckingPayment] = useState(false);
  const { user, isAuthenticated, isLoading, signOut, SignInButton } =
    useAuthentication();

  useEffect(() => {
    if (isAuthenticated) {

    }
  }, [isAuthenticated]);

  if (!isLoading && isAuthenticated) {

    return (
      <>
        <BrowserRouter>
          <ContextComposer user={user}>
            <App signOut={signOut} />
          </ContextComposer>
        </BrowserRouter>
      </>
    );
  }
  else if (!isLoading) {
    return (
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
    );
  } else {
    return null;
  }
};
export default Authoriser;
