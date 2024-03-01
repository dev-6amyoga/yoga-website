const mongoose = require("mongoose");

const InstitutePlaylistSchema = new mongoose.Schema({
  playlist_id: Number,
  user_id: Number,
  institute_id: Number,
  playlist_name: String,
  asana_ids: [Number],
  applicable_teachers: [Number],
  max_edit_count: Number,
  current_edit_count: Number,
});

const InstitutePlaylist = mongoose.model(
  "InstitutePlaylist",
  InstitutePlaylistSchema,
  "institute_playlists"
);

module.exports = InstitutePlaylist;
