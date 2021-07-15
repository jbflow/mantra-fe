import { useEffect } from "react";
import { API } from "aws-amplify";
import { loadStripe } from "@stripe/stripe-js";
const stripePromise = loadStripe(
  "pk_test_51IHT5IJlupQ2Gl7jK3ZYz4C8HaFKArzlyzAMLFpjH1jJdbpZdIyO9CwY0LJyIb3XZCLrfDJZTwWjShGZ8pd8o44U00Jhvs1NZN"
);
export default function Checkout({ paymentCreated, user }) {
  useEffect(() => {
    console.log(paymentCreated);
    if (!paymentCreated) {
      createCheckoutSession();
    }
  }, []);

  const createCheckoutSession = async (event) => {
    const stripe = await stripePromise;
    const response = await API.post(
      "talkbackBE",
      "/create_checkout_session?userId=" +
        user.attributes?.sub +
        "&email=" +
        user.attributes.email
    );
    const result = await stripe.redirectToCheckout({
      sessionId: response.id,
    });

    if (result.error) {
      // If `redirectToCheckout` fails due to a browser or network
      // error, display the localized error message to your customer
      // using `result.error.message`.
    }
  };

  return <div>Redirecting to Subscription Checkout</div>;
}
