const express = require("express");
const router = express.Router();
const { Op } = require("sequelize");
const { sequelize } = require("../init.sequelize");
const { timeout } = require("../utils/promise_timeout");
const {
  HTTP_BAD_REQUEST,
  HTTP_OK,
  HTTP_INTERNAL_SERVER_ERROR,
} = require("../utils/http_status_codes");
const { PlanPricing } = require("../models/sql/PlanPricing");

router.post("/get-inr-for-plan", async (req, res) => {
  const { plan_id } = req.body;
  if (!plan_id) {
    return res
      .status(HTTP_BAD_REQUEST)
      .json({ error: "Missing required fields" });
  }
  try {
    const plan_pricing = await PlanPricing.findAll({
      where: {
        plan_id: plan_id,
        currency_id: 1,
      },
      attributes: ["plan_pricing_id", "denomination", "currency_id", "plan_id"],
    });
    if (!plan_pricing) {
      return res
        .status(HTTP_BAD_REQUEST)
        .json({ error: "Pricing does not exist" });
    }
    return res.status(HTTP_OK).json({ plan_pricing });
  } catch (error) {
    console.error("Error fetching currencies:", error);
    res.status(HTTP_INTERNAL_SERVER_ERROR).json({
      error: "Error fetching currencies",
    });
  }
});

module.exports = router;
