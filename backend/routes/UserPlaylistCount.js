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

module.exports = router;
