const mongoose = require("mongoose");

const PlaylistConfigsSchema = new mongoose.Schema({
  playlist_config_id: Number,
  playlist_config_name: String,
  playlist_config_value: mongoose.Schema.Types.Mixed,
});

const Playlist = mongoose.model(
  "PlaylistConfigs",
  PlaylistConfigsSchema,
  "playlist_configs"
);

module.exports = Playlist;
