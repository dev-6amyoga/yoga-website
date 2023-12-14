const express = require("express");
const router = express.Router();
const Playlist = require("../models/mongo/Playlist");

router.post("/playlists/addPlaylist", async (req, res) => {
  try {
    const requestData = req.body;
    const maxIdPlaylist = await Playlist.findOne(
      {},
      {},
      { sort: { playlist_id: -1 } }
    );
    const newPlaylistId = maxIdPlaylist ? maxIdPlaylist.playlist_id + 1 : 1;
    requestData.playlist_id = newPlaylistId;
    const newPlaylist = new Playlist(requestData);
    const savedPlaylist = await newPlaylist.save();
    res.status(201).json(savedPlaylist);
  } catch (error) {
    console.error("Error saving new Playlist:", error);
    res.status(500).json({ error: "Failed to save new Playlist" });
  }
});
router.get("/playlists/getAllPlaylists", async (req, res) => {
  try {
    const playlists = await Playlist.find();
    res.json(playlists);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Failed to fetch videos" });
  }
});

router.put("/playlists/updatePlaylist/:playlistId", async (req, res) => {
  const playlistId = req.params.playlistId;
  const updatedData = req.body;
  try {
    const existingPlaylist = await Playlist.findOne({
      playlist_id: playlistId,
    });
    if (!existingPlaylist) {
      return res.status(404).json({ error: "Playlist not found" });
    }
    const mergedData = {
      ...existingPlaylist.toObject(),
      ...updatedData,
    };
    const updatedPlaylist = await Playlist.findOneAndUpdate(
      { playlist_id: playlistId },
      mergedData,
      {
        new: true,
      }
    );
    res.json(updatedPlaylist);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Failed to update Playlist" });
  }
});

router.delete("/playlists/deletePlaylist/:playlistId", async (req, res) => {
  const playlistId = req.params.playlistId;
  try {
    const deletedPlaylist = await Playlist.findOneAndDelete({
      playlist_id: playlistId,
    });
    if (deletedPlaylist) {
      res.status(200).json({
        message: "Playlist deleted successfully",
      });
    } else {
      res.status(404).json({ message: "Playlist not found" });
    }
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Failed to delete Playlist" });
  }
});

module.exports = router;
