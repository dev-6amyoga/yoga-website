const express = require("express");
const router = express.Router();
const Playlist = require("../models/mongo/Playlist");
const {
	HTTP_OK,
	HTTP_NOT_FOUND,
	HTTP_INTERNAL_SERVER_ERROR,
} = require("../utils/http_status_codes");

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
		res.status(200).json(savedPlaylist);
	} catch (error) {
		console.error("Error saving new Playlist:", error);
		res.status(HTTP_INTERNAL_SERVER_ERROR).json({
			error: "Failed to save new Playlist",
		});
	}
});
router.get("/playlists/getAllPlaylists", async (req, res) => {
	try {
		const playlists = await Playlist.find();
		res.json(playlists);
	} catch (error) {
		console.error(error);
		res.status(HTTP_INTERNAL_SERVER_ERROR).json({
			error: "Failed to fetch videos",
		});
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
			return res
				.status(HTTP_NOT_FOUND)
				.json({ error: "Playlist not found" });
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
		res.status(HTTP_INTERNAL_SERVER_ERROR).json({
			error: "Failed to update Playlist",
		});
	}
});

router.delete("/playlists/deletePlaylist/:playlistId", async (req, res) => {
	const playlistId = req.params.playlistId;
	try {
		const deletedPlaylist = await Playlist.findOneAndDelete({
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

router.post("/playlists/createManifest/:playlistId", async (req, res) => {
	const playlistId = req.params.playlistId;
	try {
		const playlist = await Playlist.findOne({
			playlist_id: playlistId,
		});

		if (playlist) {
			// get all the mpd files
			// combine them
			// save the combined mpd file
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
