const mongoose = require("mongoose");

const PlaylistSchemaUser = new mongoose.Schema({
  playlist_id: { type: String, required: true },
  playlist_user_id: Number,
  playlist_name: String,
  max_edit_count: Number,
  current_edit_count: Number,
  duration: Number,
  asana_ids: [mongoose.Schema.Types.Mixed],
});

const PlaylistUser = mongoose.model(
  "PlaylistUser",
  PlaylistSchemaUser,
  "user_playlists"
);

module.exports = PlaylistUser;
