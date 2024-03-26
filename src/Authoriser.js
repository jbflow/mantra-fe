import { useContext, useEffect, useState } from "react";
import { Auth, Amplify } from "aws-amplify";
import { Card } from "react-bootstrap";
import { BrowserRouter } from "react-router-dom";
import App from "./App";
import useAuthentication from "./hooks/useAuthentication";
import ContextComposer from "./contexts/ContextComposer";
import MobileApp from "./MobileApp";
import { UserContext } from "./contexts/UserContext";
import { useGetFromApi } from "./hooks/useGetFromApi";

require('dotenv').config()
Auth.configure({
  region: process.env.REACT_APP_AMPLIFY_REGION,
  userPoolId: process.env.REACT_APP_AMPLIFY_USER_POOL_ID,
  userPoolWebClientId: process.env.REACT_APP_AMPLIFY_APP_CLIENT_ID,

  // Cognito Hosted UI configuration
  oauth: {
    domain: process.env.REACT_APP_COGNITO_DOMAIN,
    scope: [
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


Amplify.configure({
  Auth: {
    mandatorySignIn: true,
    region: process.env.REACT_APP_AMPLIFY_REGION,
    userPoolId: process.env.REACT_APP_AMPLIFY_USER_POOL_ID,
    identityPoolId: process.env.REACT_APP_AMPLIFY_IDENTITY_POOL_ID,
    userPoolWebClientId: process.env.REACT_APP_AMPLIFY_APP_CLIENT_ID,
  },
  API: {
    endpoints: [
      {
        name: "talkbackBE",
        endpoint: process.env.REACT_APP_HTTP_API_URL,
        region: process.env.REACT_APP_AMPLIFY_REGION,
      },
    ],
  },
});

const Authoriser = () => {
  const { user, isAuthenticated, isLoading, signOut, SignInButton } = useAuthentication();
  const [width, setWidth] = useState(window.innerWidth);
  const [paymentUrl, setPaymentUrl] = useState(null)
  const {data, loading, error} = useGetFromApi(paymentUrl)
  let hasPaid = null
  hasPaid = data?.payment_status

  useEffect(() => {
    if(user){
      setPaymentUrl(`/user?userId=${user?.attributes?.sub}`)
    }
  },[user])
  

  function handleWindowSizeChange() {
    setWidth(window.innerWidth);
  }
  useEffect(() => {
    window.addEventListener('resize', handleWindowSizeChange);
    return () => {
      window.removeEventListener('resize', handleWindowSizeChange);
    }
  }, []);



  const isMobile = width <= 768;
  if (isLoading) {
    return (
      <>
        loading...
      </>
    )
  }

  if (hasPaid === null){
    return (
      <>
      checking payment
      </>
    )
  }

  if (hasPaid === "cancelled"){
    return (
      <>
      Please update your payment details by visiting <a href={`https://app.gumroad.com/subscriptions/${data?.subscription_id}/manage`}> Gumroad</a>
      </>
    )
  }

  else if (isMobile && isAuthenticated && hasPaid === "paid") {
    return (
      <>
        <BrowserRouter>
          <ContextComposer user={user} isMobile={isMobile}>
            <MobileApp signOut={signOut} isMobile={isMobile} />
          </ContextComposer>
        </BrowserRouter>
      </>
    )
  }

  if (isAuthenticated) {

    return (
      <>
        <BrowserRouter>
          <ContextComposer user={user} isMobile={isMobile}>
            <App signOut={signOut} isMobile={isMobile} />
          </ContextComposer>
        </BrowserRouter>
      </>
    );
  }
  else {
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
                New user? <a href="/">Create an account</a>
              </Card.Text>
              <SignInButton style={{ float: "right" }} />
            </Card.Body>
          </Card>
        </div>
      </>
    );
  }
};
export default Authoriser;
