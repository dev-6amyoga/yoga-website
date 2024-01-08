import { useEffect, useRef } from "react";
import crypto from "crypto-js";
import PropTypes from "prop-types";
import Axios from "axios";

const loadScript = (src) =>
  new Promise((resolve) => {
    const script = document.createElement("script");
    script.src = src;
    script.onload = () => {
      console.log("razorpay loaded successfully");
      resolve(true);
    };
    script.onerror = () => {
      console.log("error in loading razorpay");
      resolve(false);
    };
    document.body.appendChild(script);
  });

const RenderRazorpay = ({
  orderId,
  keyId,
  keySecret,
  currency,
  amount,
  setDisplayRazorpay,
}) => {
  // console.log(orderId, keyId, keySecret, currency, amount);
  const paymentId = useRef(null);
  const paymentMethod = useRef(null);

  const displayRazorpay = async (options) => {
    const res = await loadScript(
      "https://checkout.razorpay.com/v1/checkout.js"
    );
    if (!res) {
      console.log("Razorpay SDK failed to load. Are you online?");
      return;
    }
    const rzp1 = new window.Razorpay(options);
    rzp1.on("payment.submit", (response) => {
      paymentMethod.current = response.method;
    });
    rzp1.on("payment.failed", (response) => {
      paymentId.current = response.error.metadata.payment_id;
    });
    rzp1.open();
  };

  const handlePayment = async (status, orderDetails = {}) => {
    // console.log(status, orderDetails);
    const userPlanData = {
      status: status,
      orderDetails: orderDetails,
    };
    console.log(userPlanData);
    try {
      const response = await fetch("http://localhost:4000/payment/paid", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(userPlanData),
      });
      if (response.ok) {
        console.log("yay");
      } else {
        console.log("error");
      }
    } catch (error) {
      console.log(error);
    }
  };

  const options = {
    key: keyId,
    amount,
    currency,
    name: "6AM Yoga!!!",
    order_id: orderId,
    config: {
      display: {
        blocks: {
          banks: {
            name: "All payment methods",
            instruments: [
              {
                method: "upi",
              },
              {
                method: "card",
              },
              {
                method: "wallet",
              },
              {
                method: "netbanking",
              },
            ],
          },
        },
        sequence: ["block.banks"],
        preferences: {
          show_default_blocks: false,
        },
      },
    },
    handler: (response) => {
      paymentId.current = response.razorpay_payment_id;
      const succeeded =
        crypto
          .HmacSHA256(`${orderId}|${response.razorpay_payment_id}`, keySecret)
          .toString() === response.razorpay_signature;
      if (succeeded) {
        handlePayment("succeeded", {
          orderId,
          paymentId,
          signature: response.razorpay_signature,
        });
      } else {
        handlePayment("failed", {
          orderId,
          paymentId: response.razorpay_payment_id,
        });
      }
    },
    modal: {
      confirm_close: true,
      ondismiss: async (reason) => {
        const {
          reason: paymentReason,
          field,
          step,
          code,
        } = reason && reason.error ? reason.error : {};
        if (reason === undefined) {
          console.log("cancelled");
          handlePayment("Cancelled");
        } else if (reason === "timeout") {
          console.log("timedout");
          handlePayment("timedout");
        } else {
          console.log("failed");
          handlePayment("failed", {
            paymentReason,
            field,
            step,
            code,
          });
        }
      },
    },
    retry: {
      enabled: false,
    },
    timeout: 900,
    theme: {
      color: "",
    },
  };

  useEffect(() => {
    console.log("in razorpay");
    displayRazorpay(options);
  }, []);

  return null;
};

export default RenderRazorpay;
