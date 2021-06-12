import React, { useState, useEffect } from "react";

import { API } from "aws-amplify";

import { Modal } from "react-bootstrap";

import { Elements } from "@stripe/react-stripe-js";
import { loadStripe } from "@stripe/stripe-js";

import CheckoutForm from "./CheckoutForm";
import Dashboard from "../Dashboard/Dashboard";

export default function Subscription() {
  const [clientSecret, setClientSecret] = useState("");
  const [show, setShow] = useState(true);
  const handleClose = () => {
    setShow(false);
  };

  const stripePromise = loadStripe(
    "pk_test_51IHT5IJlupQ2Gl7jK3ZYz4C8HaFKArzlyzAMLFpjH1jJdbpZdIyO9CwY0LJyIb3XZCLrfDJZTwWjShGZ8pd8o44U00Jhvs1NZN"
  );

  const createCustomer = () => {
    const userId = localStorage.getItem("userId");
    const email = localStorage.getItem("email");
    API.post("talkbackBE", "/create_customer?userId=" + userId, {
      body: { email: email, price_id: "price_1Io5lDJlupQ2Gl7jIAoIfrXb" },
    }).then((res) => {
      if (res) {
        setClientSecret(res["client_secret"]);
      }
    });
  };

  useEffect(() => {
    createCustomer();
  }, []);

  return (
    <Elements stripe={stripePromise}>
      <div className="StripeModal">
        <Modal show={show} backdrop="static" keyboard={false} centered>
          <Modal.Header>
            <Modal.Title className="mx-auto">
              Please setup a payment method
            </Modal.Title>
          </Modal.Header>
          <Modal.Body className="m-auto py-3 d-block">
            <CheckoutForm
              clientSecret={clientSecret}
              handleComplete={handleClose}
            />
          </Modal.Body>
          <Modal.Footer>
            Payment will not be taken until after the 30 day trial is up.
          </Modal.Footer>
        </Modal>

        <Dashboard />
      </div>
    </Elements>
  );
}
