const mongoose = require("mongoose");

const PlaylistSchemaUser = new mongoose.Schema({
  playlist_id: { type: String, required: true },
  playlist_user_id: Number,
  playlist_name: String,
  asana_ids: [Number],
});

const PlaylistUser = mongoose.model(
  "PlaylistUser",
  PlaylistSchemaUser,
  "user_playlists"
);

module.exports = PlaylistUser;
