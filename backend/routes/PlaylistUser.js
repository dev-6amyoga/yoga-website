const express = require("express");
const router = express.Router();
const PlaylistUser = require("../models/mongo/PlaylistUser");

router.get("/getAllUserPlaylists", async (req, res) => {
  try {
    const userPlaylists = await PlaylistUser.find();
    console.log("HI", userPlaylists);
    res.json(userPlaylists);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Failed to fetch videos" });
  }
});

router.post("/addUserPlaylist", async (req, res) => {
  try {
    const requestData = req.body;
    const newUserPlaylist = new PlaylistUser(requestData);
    const savedUserPlaylist = await newUserPlaylist.save();
    res.status(201).json(savedUserPlaylist);
  } catch (error) {
    console.error("Error saving new Playlist:", error);
    res.status(500).json({ error: "Failed to save new Playlist" });
  }
});

module.exports = router;
