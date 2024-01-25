const express = require("express");

const eta = require("eta");
const path = require("path");
const router = express.Router();
const {
  HTTP_BAD_REQUEST,
  HTTP_OK,
  HTTP_INTERNAL_SERVER_ERROR,
} = require("../utils/http_status_codes");
const { Transaction } = require("../models/sql/Transaction");
const { Plan } = require("../models/sql/Plan");
const { User } = require("../models/sql/User");
const { UserPlan } = require("../models/sql/UserPlan");
const { PlanPricing } = require("../models/sql/PlanPricing");

const renderer = new eta.Eta({
  views: path.join(__dirname, "../invoice-templates"),
});

router.get("/temp", async (req, res) => {
  //   const { user_id, transaction_order_id } = req.body;
  //   if (!user_id || !transaction_order_id) {
  //     return res
  //       .status(HTTP_BAD_REQUEST)
  //       .json({ message: "Missing required fields" });
  //   }

  //   const transaction = await Transaction.findOne({
  //     where: { transaction_order_id: transaction_order_id },
  //   });
  //   if (!transaction) {
  //     return res
  //       .status(HTTP_NOT_FOUND)
  //       .json({ message: "Transaction not found" });
  //   }
  //   const user = await User.findOne({
  //     where: { user_id: user_id },
  //   });
  //   if (!user) {
  //     return res.status(HTTP_NOT_FOUND).json({ message: "User not found" });
  //   }
  //   const userPlan = await UserPlan.findOne({
  //     where: { transaction_order_id: transaction_order_id, user_id: user_id },
  //   });
  //   if (!userPlan) {
  //     return res.status(HTTP_NOT_FOUND).json({ message: "User plan not found" });
  //   }

  //   const plan = await Plan.findOne({
  //     where: { plan_id: userPlan.plan_id },
  //   });
  //   if (!plan) {
  //     return res
  //       .status(HTTP_NOT_FOUND)
  //       .json({ message: "Plan details not found" });
  //   }
  return res.status(200).send(
    await renderer.renderAsync("/student/plan-purchase", {
      transaction: {
        transaction_id: 30,
        payment_for: "user_plan",
        payment_method: "wallet",
        amount: 590,
        payment_status: "succeeded",
        payment_date: "2024-01-25T16:18:34.503Z",
        transaction_order_id: "order_NSuODFKbpUz2AE",
        transaction_payment_id: "pay_NSuOIWXD13Unmm",
        transaction_signature:
          "e5371b8b02614d96f4e2ca33c8b1e7cf44439494216b82642265c91cd0b88be8",
        created: "2024-01-25T16:18:34.504Z",
        updated: "2024-01-25T16:18:34.504Z",
        deleted_at: null,
        user_id: 14,
      },
      user: {
        user_id: 14,
        username: "smitha",
        name: "Smitha Chandran",
        email: "smritisivakumar2002abc@gmail.com",
        phone: "+919449767074",
        password:
          "$2b$10$/A3cGIWAaTQqUW1dG.R8q.sV4pBbNAzybTX2l26JhMi10i/PNP576",
        is_google_login: false,
        last_login: null,
        created: "2024-01-19T08:59:01.400Z",
        updated: "2024-01-19T08:59:01.400Z",
        deleted_at: null,
        role_id: null,
      },
      user_plan: {
        user_plan_id: 17,
        purchase_date: "2024-01-25T00:00:00.000Z",
        validity_from: "2024-02-25T00:00:00.000Z",
        validity_to: "2024-04-25T00:00:00.000Z",
        is_active: true,
        cancellation_date: null,
        auto_renewal_enabled: false,
        discount_coupon_id: 0,
        referral_code_id: 0,
        created: "2024-01-25T16:19:05.202Z",
        updated: "2024-01-25T16:19:05.202Z",
        deleted_at: null,
        user_id: 14,
        plan_id: 37,
        current_status: "STAGED",
        transaction_order_id: "order_NSuOlOcXmxLvmg",
      },
      plan: {
        plan_id: 37,
        name: "Fixed Plan Student",
        description: null,
        has_basic_playlist: true,
        has_playlist_creation: false,
        playlist_creation_limit: 0,
        has_self_audio_upload: false,
        number_of_teachers: 0,
        plan_validity: 0,
        plan_user_type: "student",
        created: "2024-01-17T16:06:21.772Z",
        updated: "2024-01-17T16:06:21.772Z",
        deleted_at: null,
      },
      plan_pricing: {
        plan_pricing_id: 37,
        denomination: 5,
        created: "2024-01-17T16:06:21.807Z",
        updated: "2024-01-17T16:06:21.807Z",
        deleted_at: null,
        plan_id: 37,
        currency_id: 1,
      },
    })
  );
});

router.post("/student/plan", async (req, res) => {
  const { user_id, transaction_order_id } = req.body;
  if (!user_id || !transaction_order_id) {
    return res
      .status(HTTP_BAD_REQUEST)
      .json({ message: "Missing required fields" });
  }

  const transaction = await Transaction.findOne({
    where: { transaction_order_id: transaction_order_id },
  });
  if (!transaction) {
    return res
      .status(HTTP_NOT_FOUND)
      .json({ message: "Transaction not found" });
  }
  const user = await User.findOne({
    where: { user_id: user_id },
  });
  if (!user) {
    return res.status(HTTP_NOT_FOUND).json({ message: "User not found" });
  }
  const userPlan = await UserPlan.findOne({
    where: { transaction_order_id: transaction_order_id, user_id: user_id },
  });
  if (!userPlan) {
    return res.status(HTTP_NOT_FOUND).json({ message: "User plan not found" });
  }

  const plan = await Plan.findOne({
    where: { plan_id: userPlan.plan_id },
  });
  if (!plan) {
    return res
      .status(HTTP_NOT_FOUND)
      .json({ message: "Plan details not found" });
  }

  const pricing = await PlanPricing.findOne({
    where: { plan_id: userPlan.plan_id, currency_id: 1 },
  });
  if (!pricing) {
    return res
      .status(HTTP_NOT_FOUND)
      .json({ message: "Pricing details not found" });
  }

  return res.status(200).send(
    await renderer.renderAsync("/student/plan-purchase", {
      transaction: transaction,
      user: user,
      userPlan: userPlan,
      plan: plan,
      pricing: pricing,
    })
  );
});

module.exports = router;
