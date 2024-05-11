const express = require("express");
const router = express.Router();
const ClassMode = require("../models/mongo/ClassMode");

router.post("/create", async (req, res) => {
  try {
    const requestData = req.body;
    const maxIdClass = await ClassMode.findOne().sort({ id: -1 }).limit(1);
    let newId;
    if (maxIdClass) {
      newId = maxIdClass.id + 1;
    } else {
      newId = 1;
    }
    requestData.id = newId;
    const newClass = new ClassMode(requestData);
    const savedClass = await newClass.save();
    res.status(200).json(savedClass);
  } catch (error) {
    console.error("Error saving new Class:", error);
    res.status(500).json({
      error: "Failed to save new Class",
    });
  }
});

router.get("/getAllClasses", async (req, res) => {
  try {
    const classes = await ClassMode.find();
    res.json(classes);
  } catch (error) {
    console.error(error);
    res.status(HTTP_INTERNAL_SERVER_ERROR).json({
      error: "Failed to fetch classes",
    });
  }
});
module.exports = router;
