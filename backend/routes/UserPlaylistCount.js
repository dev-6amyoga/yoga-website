const express = require("express");
const router = express.Router();
const UserPlaylistCount = require("../models/mongo/UserPlaylistCount");

router.get("/getAllUserPlaylistCounts", async (req, res) => {
  try {
    const userPlaylistCounts = await UserPlaylistCount.find();
    res.json(userPlaylistCounts);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Failed to fetch counts" });
  }
});

router.post("/addUserPlaylistCount", async (req, res) => {
  try {
    const requestData = req.body;
    const newUserPlaylistCount = new UserPlaylistCount(requestData);
    const savedUserPlaylistCount = await newUserPlaylistCount.save();
    res.status(201).json(savedUserPlaylistCount);
  } catch (error) {
    console.error("Error saving new UserPlaylistCount:", error);
    res.status(500).json({ error: "Failed to save new UserPlaylistCount" });
  }
});

router.put("/updateUserPlaylistCount/:user_id", async (req, res) => {
  const user_id = req.params.user_id;
  const updatedData = req.body;
  try {
    const existingUserPlaylistCount = await UserPlaylistCount.findOne({
      user_id: user_id,
    });
    if (!existingUserPlaylistCount) {
      return res.status(404).json({ error: "Not found" });
    }
    const mergedData = {
      ...existingUserPlaylistCount.toObject(),
      ...updatedData,
    };
    const updatedUserPlaylistCount = await UserPlaylistCount.findOneAndUpdate(
      { user_id: user_id },
      mergedData,
      {
        new: true,
      }
    );
    res.json(updatedUserPlaylistCount);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Failed to update" });
  }
});
module.exports = router;
