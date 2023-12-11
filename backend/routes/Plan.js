const express = require("express");
const router = express.Router();
const {
  HTTP_BAD_REQUEST,
  HTTP_OK,
  HTTP_INTERNAL_SERVER_ERROR,
} = require("../utils/http_status_codes");
const { Plan } = require("../models/sql/Plan");

router.get("/get-all-plans", async (req, res) => {
  try {
    const plans = await Plan.findAll();
    res.status(HTTP_OK).json({ plans });
  } catch (error) {
    console.error("Error fetching plans:", error);
    res
      .status(HTTP_INTERNAL_SERVER_ERROR)
      .json({ error: "Internal Server Error" });
  }
});

router.get("/get-all-student-plans", async (req, res) => {
  try {
    const plans = await Plan.findAll({
      where: {
        plan_user_type: "student",
      },
    });
    return res.status(HTTP_OK).json({ plans });
  } catch (error) {
    console.error("Error fetching plans:", error);
    return res
      .status(HTTP_INTERNAL_SERVER_ERROR)
      .json({ error: "Internal Server Error" });
  }
});

module.exports = router;
