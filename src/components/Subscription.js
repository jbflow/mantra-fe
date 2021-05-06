import React, { useState } from "react";

import { Button, Modal } from "react-bootstrap";

import { Elements } from "@stripe/react-stripe-js";
import { loadStripe } from "@stripe/stripe-js";

import StripeCardSection from "./StripeCardSection";

export default function Subscription() {
  const [show, setShow] = useState(true);
  const handleClose = () => setShow(false); // Handle a redirect to dashboard

  const stripePromise = loadStripe(
    "pk_test_51IHT5IJlupQ2Gl7jK3ZYz4C8HaFKArzlyzAMLFpjH1jJdbpZdIyO9CwY0LJyIb3XZCLrfDJZTwWjShGZ8pd8o44U00Jhvs1NZN"
  );

  const createCustomer = () => {
    const userId = localStorage.getItem("userId");
    const email = localStorage.getItem("email");
    API.post("talkbackBE", "/create_customer?" + userId, {
      body: { email: email, price_id: "price_1Io5lDJlupQ2Gl7jIAoIfrXb" },
    }).then((res) => {
      console.log(res["client_secret"]);
      console.log(res["sub_id"]);
    });
  };

  return (
    <Elements stripe={stripePromise}>
      <div className="StripeModal">
        <Modal
          show={show}
          onHide={handleClose}
          backdrop="static"
          keyboard={false}
          centered
        >
          <Modal.Header>
            <Modal.Title className="mx-auto">
              Purchase A Subscription
            </Modal.Title>
          </Modal.Header>
          <Modal.Body className="m-auto py-3 d-block">
            <StripeCardSection />
          </Modal.Body>
          <Modal.Footer>
            <Button
              variant="primary"
              onClick={handleClose}
              className="mx-auto my-3"
            >
              (Redirect automatically when paid instead of button)
            </Button>
          </Modal.Footer>
        </Modal>
      </div>
    </Elements>
  );
}
