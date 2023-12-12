const express = require("express");
const router = express.Router();
const {
  HTTP_BAD_REQUEST,
  HTTP_OK,
  HTTP_INTERNAL_SERVER_ERROR,
} = require("../utils/http_status_codes");
const { UserPlan } = require("../models/sql/UserPlan");

router.get("/get-all-user-plans", async (req, res) => {
  try {
    const userplans = await UserPlan.findAll();
    res.status(HTTP_OK).json({ userplans });
  } catch (error) {
    console.error("Error fetching plans:", error);
    res
      .status(HTTP_INTERNAL_SERVER_ERROR)
      .json({ error: "Internal Server Error" });
  }
});

module.exports = router;
