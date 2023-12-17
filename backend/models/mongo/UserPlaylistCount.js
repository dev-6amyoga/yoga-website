const mongoose = require("mongoose");

const UserPlaylistCountSchema = new mongoose.Schema({
  playlist_user_id: Number,
  user_id: Number,
  user_type: String,
  current_count: Number,
  maximum_count: Number,
});

const UserPlaylistCount = mongoose.model(
  "userPlaylistCount",
  UserPlaylistCountSchema,
  "userPlaylistCount"
);

module.exports = UserPlaylistCount;
