const express = require("express");
const router = express.Router();
const PlaylistUser = require("../models/mongo/PlaylistUser");
const {
  HTTP_OK,
  HTTP_NOT_FOUND,
  HTTP_INTERNAL_SERVER_ERROR,
} = require("../utils/http_status_codes");

router.get("/getAllUserPlaylists/:user_id", async (req, res) => {
  try {
    const user_id = Number(req.params["user_id"]);
    const userPlaylists = await PlaylistUser.find({
      playlist_user_id: user_id,
    });
    res.json(userPlaylists);
  } catch (error) {
    console.error(error);
    res.status(HTTP_INTERNAL_SERVER_ERROR).json({
      error: "Failed to fetch videos",
    });
  }
});

router.post("/addUserPlaylist", async (req, res) => {
  try {
    const requestData = req.body;
    const newUserPlaylist = new PlaylistUser(requestData);
    const savedUserPlaylist = await newUserPlaylist.save();
    res.status(20).json(savedUserPlaylist);
  } catch (error) {
    console.error("Error saving new Playlist:", error);
    res.status(HTTP_INTERNAL_SERVER_ERROR).json({
      error: "Failed to save new Playlist",
    });
  }
});

router.put("/updateUserPlaylist/:playlistId", async (req, res) => {
  const playlistId = req.params.playlistId;
  const updatedData = req.body;
  try {
    const existingPlaylist = await PlaylistUser.findOne({
      playlist_id: playlistId,
    });
    if (!existingPlaylist) {
      return res.status(HTTP_NOT_FOUND).json({ error: "Playlist not found" });
    }
    const mergedData = {
      ...existingPlaylist.toObject(),
      ...updatedData,
    };
    const updatedPlaylist = await PlaylistUser.findOneAndUpdate(
      { playlist_id: playlistId },
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

router.delete("/deleteUserPlaylist/:playlistId", async (req, res) => {
  const playlistId = req.params.playlistId;
  try {
    const deletedPlaylist = await PlaylistUser.findOneAndDelete({
      playlist_id: playlistId,
    });
    if (deletedPlaylist) {
      res.status(HTTP_OK).json({
        message: "Playlist deleted successfully",
      });
    } else {
      res.status(HTTP_NOT_FOUND).json({ message: "Playlist not found" });
    }
  } catch (error) {
    console.error(error);
    res.status(HTTP_INTERNAL_SERVER_ERROR).json({
      error: "Failed to delete Playlist",
    });
  }
});
module.exports = router;
