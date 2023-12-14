const mongoose = require("mongoose");

const PlaylistSchemaUser = new mongoose.Schema({
  playlist_id: { type: String, required: true }, //(combination of user_id and playlist number)
  playlist_user_id: Number,
  user_type: String,
  playlist_name: String,
  asana_ids: [Number],
});

const PlaylistUser = mongoose.model(
  "PlaylistUser",
  PlaylistSchemaUser,
  "user_playlists"
);

module.exports = PlaylistUser;
