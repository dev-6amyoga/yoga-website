const express = require("express");
const router = express.Router();
const Playlist = require("../models/Playlist");

router.post("/addPlaylist", async (req, res) => {
  try {
    const requestData = req.body;
    const maxIdPlaylist = await Playlist.findOne(
      {},
      {},
      { sort: { playlist_id: -1 } }
    );
    const newPlaylistId = maxIdPlaylist ? maxIdPlaylist.playlist_id + 1 : 1;
    console.log(newPlaylistId, maxIdPlaylist);
    requestData.playlist_id = newPlaylistId;
    const newPlaylist = new Playlist(requestData);
    const savedPlaylist = await newPlaylist.save();
    res.status(201).json(savedPlaylist);
  } catch (error) {
    console.error("Error saving new Playlist:", error);
    res.status(500).json({ error: "Failed to save new Playlist" });
  }
});
router.get("/content/playlists/getAllPlaylists", async (req, res) => {
  try {
    const playlists = await Playlist.find();
    console.log(playlists);
    res.json(playlists);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Failed to fetch videos" });
  }
});

module.exports = router;
