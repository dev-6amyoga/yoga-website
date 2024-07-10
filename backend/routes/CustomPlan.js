const express = require("express");
const router = express.Router();
const CustomPlan = require("../models/mongo/CustomPlan");
const {
  HTTP_OK,
  HTTP_NOT_FOUND,
  HTTP_INTERNAL_SERVER_ERROR,
} = require("../utils/http_status_codes");

router.post("/addCustomPlan", async (req, res) => {
  try {
    const requestData = req.body;
    const maxIdCustomPlan = await CustomPlan.findOne(
      {},
      {},
      { sort: { custom_playlist_id: -1 } }
    );
    const newCustomPlanId = maxIdCustomPlan
      ? maxIdCustomPlan.custom_playlist_id + 1
      : 1;

    requestData.custom_playlist_id = newCustomPlanId;
    const newCustomPlan = new CustomPlan(requestData);
    const saveCustomPlan = await newCustomPlan.save();
    res.status(200).json(saveCustomPlan);
  } catch (error) {
    console.error("Error saving new custom plan:", error);
    res.status(HTTP_INTERNAL_SERVER_ERROR).json({
      error: "Failed to save new custom plan",
    });
  }
});

module.exports = router;
