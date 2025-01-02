const mongoose = require('mongoose')

const PlaylistSchema6am = new mongoose.Schema({
  playlist_id: { type: Number, required: true },
  playlist_name: String,
  asana_ids: [mongoose.Schema.Types.Mixed],
  playlist_dash_url: String,
  duration: Number,
  playlist_start_date: Date,
  playlist_end_date: Date,
  playlist_language: String,
  playlist_mode: String,
  drm_playlist: Boolean,
  sections: [
    {
      name: String,
      time: Number,
    },
  ],
  last_updated: { type: Date },
})

const Playlist = mongoose.model(
  'Playlists',
  PlaylistSchema6am,
  '6amyoga_playlists'
)

module.exports = Playlist
