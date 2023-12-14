const express = require("express");
const router = express.Router();
const PlaylistUser = require("../models/mongo/PlaylistUser");

router.get("/getAllUserPlaylists", async (req, res) => {
  try {
    const userPlaylists = await PlaylistUser.find();
    res.json(userPlaylists);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Failed to fetch videos" });
  }
});

module.exports = router;
