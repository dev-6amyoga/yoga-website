const express = require("express");
const router = express.Router();
const {
  HTTP_BAD_REQUEST,
  HTTP_OK,
  HTTP_INTERNAL_SERVER_ERROR,
} = require("../utils/http_status_codes");
const InstitutePlaylist = require("../models/mongo/InstitutePlaylist");

router.post("/add-playlist", async (req, res) => {
  try {
    const requestData = req.body;
    const maxIdPlaylist = await InstitutePlaylist.findOne(
      {},
      {},
      { sort: { playlist_id: -1 } }
    );
    const newPlaylistId = maxIdPlaylist ? maxIdPlaylist.playlist_id + 1 : 1;
    requestData.playlist_id = newPlaylistId;
    const newPlaylist = new InstitutePlaylist(requestData);
    const savedPlaylist = await newPlaylist.save();
    res.status(200).json(savedPlaylist);
  } catch (error) {
    console.error("Error saving new Playlist:", error);
    res.status(HTTP_INTERNAL_SERVER_ERROR).json({
      error: "Failed to save new Playlist",
    });
  }
});

router.post("/get-playlists", async (req, res) => {
  try {
    const requestData = req.body;
    const institute_id = requestData.institute_id;
    const user_id = requestData.user_id;
    const allPlaylists = await InstitutePlaylist.find({
      institute_id: institute_id,
    });
    res.status(200).json(allPlaylists);
  } catch (error) {
    console.error("Error getting playlists:", error);
    res.status(HTTP_INTERNAL_SERVER_ERROR).json({
      error: "Failed to get all playlists",
    });
  }
});

module.exports = router;
