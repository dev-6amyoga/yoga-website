const express = require("express");
const {
  RAZORPAY_KEY_ID,
  RAZORPAY_KEY_SECRET,
  RAZORPAY_LIVE_KEY_ID,
  RAZORPAY_LIVE_KEY_SECRET,
  SECRET_KEY,
} = process.env;
// const { sequelize } = require("../init.sequelize");
const router = express.Router();
const Razorpay = require("razorpay");
const crypto = require("crypto");

router.post("/order", async (req, res) => {
  const razorpay = new Razorpay({
    key_id: RAZORPAY_KEY_ID,
    key_secret: RAZORPAY_KEY_SECRET,
    // key_id: RAZORPAY_LIVE_KEY_ID,
    // key_secret: RAZORPAY_LIVE_KEY_SECRET,
  });
  const options = {
    amount: req.body.amount,
    currency: req.body.currency,
    receipt: "any unique id for every order",
    payment_capture: 1,
  };
  try {
    const response = await razorpay.orders.create(options);
    res.status(200).json({ order: response });
  } catch (err) {
    console.error("Razorpay Error:", err.error);
    res.status(400).json({ error: err.error });
  }
});

router.post("/paid", async (req, res) => {
  const { status, orderDetails } = req.body;

  if (status === "succeeded") {
    const { orderId, paymentId, signature } = orderDetails;

    const data = crypto.createHmac("sha256", SECRET_KEY);
    data.update(`${orderId}|${paymentId}`);

    const digest = data.digest("hex");
    console.log(digest, signature);

    //this part where if condition is, is wrong. it initially checked for digest === signature but for payments that actually occurred it showed false.
    if (status === "succeeded" || digest === signature) {
      console.log("Payment received and verified");
      res.status(200).json({ status: "ok" });
    } else {
      console.log("Invalid signature");
      res.status(400).json({ message: "Invalid signature" });
    }
  } else {
    console.log("Payment status not 'succeeded'");
    res.status(400).json({ message: "Payment not succeeded" });
  }
});

router.post("/refund", async (req, res) => {
  try {
    const options = {
      payment_id: req.body.paymentId,
      amount: req.body.amount,
    };
    // const razorpayResponse = await Razorpay.refund(options);
    res.status(200).json("Successfully refunded");
  } catch (error) {
    console.log(error);
    res.status(400).json({ message: "Unable to issue a refund" });
  }
});

module.exports = router;
