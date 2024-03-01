const express = require("express");
const router = express.Router();
const PlaylistConfigs = require("../models/mongo/PlaylistConfigs");
const {
  HTTP_OK,
  HTTP_NOT_FOUND,
  HTTP_INTERNAL_SERVER_ERROR,
} = require("../utils/http_status_codes");

router.post("/addConfig", async (req, res) => {
  try {
    const requestData = req.body;
    const maxIdPlaylist = await PlaylistConfigs.findOne(
      {},
      {},
      { sort: { playlist_config_id: -1 } }
    );
    let newPlaylistId = 1;
    if (maxIdPlaylist === null) {
      newPlaylistId = 1;
    } else {
      newPlaylistId = maxIdPlaylist.playlist_id + 1;
    }
    requestData.playlist_config_id = newPlaylistId;
    const newPlaylist = new PlaylistConfigs(requestData);
    const savedPlaylist = await newPlaylist.save();
    res.status(200).json(savedPlaylist);
  } catch (error) {
    console.error("Error saving new Playlist Config:", error);
    res.status(HTTP_INTERNAL_SERVER_ERROR).json({
      error: "Failed to save new Playlist Config",
    });
  }
});

router.get("/getAllConfigs", async (req, res) => {
  try {
    const playlists = await PlaylistConfigs.find();
    res.json(playlists);
  } catch (error) {
    console.error(error);
    res.status(HTTP_INTERNAL_SERVER_ERROR).json({
      error: "Failed to fetch videos",
    });
  }
});

router.put("/updateConfig/:configId", async (req, res) => {
  const configId = req.params.configId;
  const updatedData = req.body;
  try {
    const existingPlaylist = await PlaylistConfigs.findOne({
      playlist_config_id: configId,
    });
    if (!existingPlaylist) {
      return res
        .status(HTTP_NOT_FOUND)
        .json({ error: "Playlist Config not found" });
    }
    const mergedData = {
      ...existingPlaylist.toObject(),
      ...updatedData,
    };
    const updatedPlaylist = await PlaylistConfigs.findOneAndUpdate(
      { playlist_config_id: configId },
      mergedData,
      {
        new: true,
      }
    );
    res.json(updatedPlaylist);
  } catch (error) {
    console.error(error);
    res.status(HTTP_INTERNAL_SERVER_ERROR).json({
      error: "Failed to update Playlist",
    });
  }
});

router.delete("/deleteConfig/:configId", async (req, res) => {
  const configId = req.params.configId;
  try {
    const deletedPlaylist = await PlaylistConfigs.findOneAndDelete({
      playlist_config_id: configId,
    });
    if (deletedPlaylist) {
      res.status(HTTP_OK).json({
        message: "Playlist Config deleted successfully",
      });
    } else {
      res.status(HTTP_NOT_FOUND).json({ message: "Playlist Config not found" });
    }
  } catch (error) {
    console.error(error);
    res.status(HTTP_INTERNAL_SERVER_ERROR).json({
      error: "Failed to delete Playlist Config",
    });
  }
});

module.exports = router;
