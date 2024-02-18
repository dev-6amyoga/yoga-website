const express = require("express");
const router = express.Router();
const Schedule = require("../models/mongo/Schedules");
const {
  HTTP_OK,
  HTTP_NOT_FOUND,
  HTTP_INTERNAL_SERVER_ERROR,
} = require("../utils/http_status_codes");

router.post("/addSchedule", async (req, res) => {
  try {
    const requestData = req.body;
    const maxId = await Schedule.findOne({}, {}, { sort: { schedule_id: -1 } });
    const newId = maxId ? maxId.schedule_id + 1 : 1;
    requestData.schedule_id = newId;
    const newSchedule = new Schedule(requestData);
    const savedSchedule = await newSchedule.save();
    res.status(200).json(savedSchedule);
  } catch (error) {
    console.error("Error saving new Schedule:", error);
    res.status(HTTP_INTERNAL_SERVER_ERROR).json({
      error: "Failed to save new Schedule",
    });
  }
});

router.get("/getAllSchedulesForUser", async (req, res) => {
  try {
    const schedules = await Schedule.find();
    res.json(schedules);
  } catch (error) {
    console.error(error);
    res.status(HTTP_INTERNAL_SERVER_ERROR).json({
      error: "Failed to fetch schedules",
    });
  }
});
module.exports = router;
