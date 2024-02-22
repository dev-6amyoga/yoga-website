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

router.get("/getAllSchedules", async (req, res) => {
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

router.post("/getSchedulesById", async (req, res) => {
  try {
    const { user_id, user_type, institute_id } = req.body;
    const schedules = await Schedule.find();
    const currentDate = new Date();
    var applicableId1 = "";
    var applicableId2 = "";
    if (user_type === "STUDENT" && institute_id === 0) {
      applicableId1 = "Student_" + String(user_id);
    }
    if (user_type === "TEACHER") {
      applicableId1 = "Teacher_" + String(user_id);
      applicableId2 = "Institute_" + String(institute_id);
    }
    if (user_type === "INSTITUTE") {
      applicableId1 = "Institute_" + String(institute_id);
    }
    var resultSet = [];
    for (var i = 0; i < schedules.length; i++) {
      const schedule = schedules[i];
      if (
        (applicableId2 !== "" &&
          schedule.applicable_ids.includes(applicableId2)) ||
        (applicableId1 !== "" &&
          schedule.applicable_ids.includes(applicableId1))
      ) {
        const validityFrom = new Date(schedule.validity_from);
        const validityTo = new Date(schedule.validity_to);
        if (validityFrom <= currentDate && currentDate <= validityTo) {
          resultSet.push(schedule);
        }
      }
    }

    res.status(200).json(resultSet);
  } catch (error) {
    console.error(error);
    res.status(HTTP_INTERNAL_SERVER_ERROR).json({
      error: "Failed to fetch schedules",
    });
  }
});

router.post("/getNextMonthSchedulesById", async (req, res) => {
  try {
    const { user_id, user_type, institute_id } = req.body;
    const schedules = await Schedule.find();
    const currentDate = new Date();
    var applicableId1 = "";
    var applicableId2 = "";
    if (user_type === "STUDENT" && institute_id === 0) {
      applicableId1 = "Student_" + String(user_id);
    }
    if (user_type === "TEACHER") {
      applicableId1 = "Teacher_" + String(user_id);
      applicableId2 = "Institute_" + String(institute_id);
    }
    if (user_type === "INSTITUTE") {
      applicableId1 = "Institute_" + String(institute_id);
    }
    var resultSet = [];
    const firstDayOfNextMonth = new Date(
      currentDate.getFullYear(),
      currentDate.getMonth() + 1,
      1
    );
    const lastDayOfNextMonth = new Date(
      currentDate.getFullYear(),
      currentDate.getMonth() + 2,
      0
    );
    for (var i = 0; i < schedules.length; i++) {
      const schedule = schedules[i];
      if (
        (applicableId2 !== "" &&
          schedule.applicable_ids.includes(applicableId2)) ||
        (applicableId1 !== "" &&
          schedule.applicable_ids.includes(applicableId1))
      ) {
        const validityFrom = new Date(schedule.validity_from);
        if (
          validityFrom >= firstDayOfNextMonth &&
          validityFrom <= lastDayOfNextMonth
        ) {
          resultSet.push(schedule);
        }
      }
    }
    res.status(200).json(resultSet);
  } catch (error) {
    console.error(error);
    res.status(HTTP_INTERNAL_SERVER_ERROR).json({
      error: "Failed to fetch schedules",
    });
  }
});

module.exports = router;
