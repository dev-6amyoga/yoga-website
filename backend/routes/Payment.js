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
const { sequelize } = require("../init.sequelize");
const { Transaction } = require("../models/sql/Transaction");
const {
  HTTP_BAD_REQUEST,
  HTTP_INTERNAL_SERVER_ERROR,
  HTTP_OK,
} = require("../utils/http_status_codes");

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
    res.status(HTTP_OK).json({ order: response });
  } catch (err) {
    console.error("Razorpay Error:", err.error);
    res.status(HTTP_BAD_REQUEST).json({ error: err.error });
  }
});
router.post("/commit", async (req, res) => {
  const {
    user_id,
    status,
    payment_for,
    payment_method,
    amount,
    signature,
    order_id,
    payment_id,
  } = req.body;

  if (
    !user_id ||
    !status ||
    !payment_for ||
    !payment_method ||
    !amount ||
    !signature ||
    !order_id ||
    !payment_id
  ) {
    res.status(HTTP_BAD_REQUEST).json({
      message: "Missing required fields",
    });
  }

  // TODO: fix this; not same as frontend hash for some reason
  const data = crypto.createHmac("sha256", SECRET_KEY, {});
  data.update(`${order_id}|${payment_id}`);
  const digest = data.digest("hex");
  console.log(digest, signature);

  const t = await sequelize.transaction();

  try {
    // create a transaction in the database
    const transaction = await Transaction.create(
      {
        payment_for: payment_for,
        payment_method: payment_method,
        amount: amount,
        payment_status: status,
        payment_date: new Date(),
        transaction_order_id: order_id,
        transaction_payment_id: payment_id,
        transaction_signature: signature,
        user_id: user_id,
      },
      { transaction: t }
    );

    await t.commit();
    res.status(HTTP_OK).json({ status: "successfully saved transaction" });
  } catch (err) {
    console.log(err);
    await t.rollback();
    res.status(HTTP_BAD_REQUEST).json({
      message: "Unable to create transaction",
    });
  }
});

router.post("/refund", async (req, res) => {
  try {
    const options = {
      payment_id: req.body.paymentId,
      amount: req.body.amount,
    };
    // const razorpayResponse = await Razorpay.refund(options);
    res.status(HTTP_OK).json("Successfully refunded");
  } catch (err) {
    console.log(error);
    res.status(400).json({ message: "Unable to issue a refund" });
  }
});

module.exports = router;
