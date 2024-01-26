const express = require("express");
const router = express.Router();
const {
  HTTP_BAD_REQUEST,
  HTTP_OK,
  HTTP_INTERNAL_SERVER_ERROR,
} = require("../utils/http_status_codes");
const { UserPlan } = require("../models/sql/UserPlan");
const { Plan } = require("../models/sql/Plan");
const { User } = require("../models/sql/User");
const { Op } = require("sequelize");
const { sequelize } = require("../init.sequelize");
const { timeout } = require("../utils/promise_timeout");
const {
  UserInstitutePlanRole,
} = require("../models/sql/UserInstitutePlanRole");

router.get("/get-all-user-plans", async (req, res) => {
  try {
    const userplans = await UserPlan.findAll();
    res.status(HTTP_OK).json({ userplans });
  } catch (error) {
    console.error("Error fetching plans:", error);
    res.status(HTTP_INTERNAL_SERVER_ERROR).json({
      error: "Internal Server Error",
    });
  }
});

router.post("/get-user-plan-by-id", async (req, res) => {
  const { user_id } = req.body;
  if (!user_id) {
    return res
      .status(HTTP_BAD_REQUEST)
      .json({ error: "Missing required fields" });
  }
  try {
    const userPlan = await UserPlan.findAll({
      where: {
        user_id: user_id,
      },
      include: [
        { model: User, attributes: ["name"] },
        {
          model: Plan,
          attributes: [
            "name",
            "has_basic_playlist",
            "has_playlist_creation",
            "playlist_creation_limit",
            "has_self_audio_upload",
            "number_of_teachers",
          ],
        },
      ],
    });
    return res.status(HTTP_OK).json({ userPlan: userPlan ? userPlan : null });
  } catch (error) {
    console.error(error);
    return res
      .status(HTTP_INTERNAL_SERVER_ERROR)
      .json({ error: "Failed to fetch user" });
  }
});

router.post("/register", async (req, res) => {
  console.log(req.body);
  const {
    purchase_date,
    validity_from,
    validity_to,
    cancellation_date,
    auto_renewal_enabled,
    discount_coupon_id,
    referral_code_id,
    user_id,
    plan_id,
    current_status,
    transaction_order_id,
    user_type,
  } = req.body;
  console.log("registering!!");

  if (
    !user_id ||
    !plan_id ||
    !validity_from ||
    !validity_to ||
    !purchase_date ||
    !current_status ||
    !transaction_order_id ||
    !user_type
  )
    return res
      .status(HTTP_BAD_REQUEST)
      .json({ error: "Missing required fields" });

  const user_plan = await UserPlan.findOne({
    where: {
      user_id: user_id,
      [Op.or]: [
        {
          validity_from: {
            [Op.between]: [validity_from, validity_to],
          },
        },
        {
          validity_to: {
            [Op.between]: [validity_from, validity_to],
          },
        },
        {
          [Op.and]: [
            { validity_from: { [Op.lte]: validity_from } },
            { validity_to: { [Op.gte]: validity_to } },
          ],
        },
      ],
    },
    attributes: ["user_id", "validity_from", "validity_to"],
  });

  if (user_plan)
    return res
      .status(HTTP_BAD_REQUEST)
      .json({ error: "User already has a plan." });

  // db transaction
  const t = await sequelize.transaction();
  try {
    // find plan by id
    let plan = null;
    if (plan_id !== "") {
      plan = await Plan.findOne(
        {
          where: { plan_id: plan_id },
          attributes: ["plan_id"],
        },
        { transaction: t }
      );
      if (!plan) throw new Error("Plan doesn't exist");
    }

    // find user by id
    const user = await User.findOne(
      {
        where: { user_id: user_id },
        attributes: ["user_id"],
      },
      { transaction: t }
    );
    if (!user) throw new Error("User doesn't exist");

    // create userPlan
    const newUserPlan = await UserPlan.create(
      {
        purchase_date: purchase_date,
        validity_from: validity_from,
        validity_to: validity_to,
        cancellation_date: cancellation_date,
        auto_renewal_enabled: auto_renewal_enabled,
        discount_coupon_id: discount_coupon_id,
        referral_code_id: referral_code_id,
        user_id: user_id,
        plan_id: plan_id,
        current_status: current_status,
        transaction_order_id: transaction_order_id,
        user_type: user_type,
      },
      { transaction: t }
    );
    await timeout(t.commit(), 5000, new Error("timeout; try again"));
    return res.status(HTTP_OK).json({ userPlan: newUserPlan });
  } catch (error) {
    console.error(error);
    await t.rollback();
    switch (error.message) {
      case "Plan doesn't exist":
      case "User doesn't exist":
        return res
          .status(HTTP_BAD_REQUEST)
          .json({ error: "Missing required fields" });
    }
  }
});

router.put("/update-user-plan", async (req, res) => {
  console.log("IN UPDATE");
  console.log(req.body);
  const {
    user_plan_id,
    purchase_date,
    validity_from,
    validity_to,
    cancellation_date,
    auto_renewal_enabled,
    discount_coupon_id,
    referral_code_id,
    user_id,
    plan_id,
    current_status,
  } = req.body;
  if (
    !user_plan_id ||
    !user_id ||
    !plan_id ||
    !validity_from ||
    !validity_to ||
    !purchase_date ||
    !current_status
  )
    return res
      .status(HTTP_BAD_REQUEST)
      .json({ error: "Missing required fields" });
  const existingUserPlan = await UserPlan.findByPk(user_plan_id);
  if (!existingUserPlan)
    return res
      .status(HTTP_BAD_REQUEST)
      .json({ error: "UserPlan does not exist." });
  const t = await sequelize.transaction();
  try {
    let plan = null;
    if (plan_id !== "") {
      plan = await Plan.findOne(
        {
          where: { plan_id: plan_id },
          attributes: ["plan_id"],
        },
        { transaction: t }
      );
      if (!plan) throw new Error("Plan doesn't exist");
    }
    const user = await User.findOne(
      {
        where: { user_id: user_id },
        attributes: ["user_id"],
      },
      { transaction: t }
    );
    if (!user) throw new Error("User doesn't exist");
    const updatedUserPlan = await existingUserPlan.update(
      {
        purchase_date: purchase_date,
        validity_from: validity_from,
        validity_to: validity_to,
        cancellation_date: cancellation_date,
        auto_renewal_enabled: auto_renewal_enabled,
        discount_coupon_id: discount_coupon_id,
        referral_code_id: referral_code_id,
        user_id: user_id,
        plan_id: plan_id,
        current_status: current_status,
      },
      {
        where: {
          user_plan_id: user_plan_id,
        },
      },

      { transaction: t }
    );
    const x = await UserInstitutePlanRole.update(
      {
        user_plan_id: user_plan_id,
      },
      {
        where: {
          user_id: user_id,
        },
      }
    );
    await timeout(t.commit(), 5000, new Error("timeout; try again"));
    return res.status(HTTP_OK).json({ userPlan: updatedUserPlan });
  } catch (error) {
    console.error(error);
    await t.rollback();
    switch (error.message) {
      case "Plan doesn't exist":
      case "User doesn't exist":
        return res
          .status(HTTP_BAD_REQUEST)
          .json({ error: "Missing required fields" });
      default:
        return res
          .status(HTTP_INTERNAL_SERVER_ERROR)
          .json({ error: "Failed to update user plan" });
    }
  }
});

module.exports = router;
