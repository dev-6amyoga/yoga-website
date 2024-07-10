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
    res.status(HTTP_OK).json(saveCustomPlan);
  } catch (error) {
    console.error("Error saving new custom plan:", error);
    res.status(HTTP_INTERNAL_SERVER_ERROR).json({
      error: "Failed to save new custom plan",
    });
  }
});

// router.post("/addCustomPlan", async (req, res) => {
//   try {
//     const requestData = req.body;
//     const maxIdCustomPlan = await CustomPlan.findOne(
//       {},
//       {},
//       { sort: { custom_playlist_id: -1 } }
//     );
//     const newCustomPlanId = maxIdCustomPlan
//       ? maxIdCustomPlan.custom_playlist_id + 1
//       : 1;

//     requestData.custom_playlist_id = newCustomPlanId;
//     const newCustomPlan = new CustomPlan(requestData);
//     const saveCustomPlan = await newCustomPlan.save();
//     res.status(200).json(saveCustomPlan);
//   } catch (error) {
//     console.error("Error saving new custom plan:", error);
//     res.status(HTTP_INTERNAL_SERVER_ERROR).json({
//       error: "Failed to save new custom plan",
//     });
//   }
// });

router.get("/getAllCustomPlans", async (req, res) => {
  try {
    const customPlans = await CustomPlan.find({});
    res.status(HTTP_OK).json(customPlans);
  } catch (error) {
    console.error("Error fetching custom plans:", error);
    res.status(HTTP_INTERNAL_SERVER_ERROR).json({
      error: "Failed to fetch custom plans",
    });
  }
});

router.get("/getCustomPlansByUser/:user_id", async (req, res) => {
  try {
    const userId = parseInt(req.params.user_id);
    const customPlans = await CustomPlan.find({ students: userId });
    if (customPlans.length > 0) {
      res.status(HTTP_OK).json(customPlans);
    } else {
      res.status(HTTP_NOT_FOUND).json({
        error: "No custom plans found for the given user ID",
      });
    }
  } catch (error) {
    console.error("Error fetching custom plans for user:", error);
    res.status(HTTP_INTERNAL_SERVER_ERROR).json({
      error: "Failed to fetch custom plans for user",
    });
  }
});

router.put("/editCustomPlan/:id", async (req, res) => {
  try {
    const planId = req.params.id;
    const updateData = req.body;
    const updatedCustomPlan = await CustomPlan.findByIdAndUpdate(
      planId,
      updateData,
      { new: true }
    );
    if (updatedCustomPlan) {
      res.status(HTTP_OK).json(updatedCustomPlan);
    } else {
      res.status(HTTP_NOT_FOUND).json({
        error: "Custom plan not found",
      });
    }
  } catch (error) {
    console.error("Error updating custom plan:", error);
    res.status(HTTP_INTERNAL_SERVER_ERROR).json({
      error: "Failed to update custom plan",
    });
  }
});

module.exports = router;
