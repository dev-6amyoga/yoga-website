const express = require("express");
const { RAZORPAY_KEY_ID, RAZORPAY_KEY_SECRET, SECRET_KEY } = process.env;
const { sequelize } = require("../init.sequelize");
const router = express.Router();
const Razorpay = require("razorpay");
const crypto = require("crypto");

router.post("/order", async (req, res) => {
  const razorpay = new Razorpay({
    key_id: RAZORPAY_KEY_ID,
    key_secret: RAZORPAY_KEY_SECRET,
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

router.post("/payment", (req, res) => {
  const data = crypto.createHmac("sha256", SECRET_KEY);
  data.update(JSON.stringify(req.body));
  const digest = data.digest("hex");
  if (digest === req.headers["x-razorpay-signature"]) {
    console.log("request is legit");
    res.status(200).json({
      status: "ok",
    });
  } else {
    res.status(400).json({ message: "Invalid signature" });
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
