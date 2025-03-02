const mongoose = require('mongoose')

const UserPlaylistSchema = new mongoose.Schema({
  user_id: Number,
  playlists: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Playlists' }],
  month: { type: String, required: true },
  created_at: { type: Date, default: Date.now },
  edits_left: { type: Number, default: 2 },
})

const UserPlaylist = mongoose.model('UserPlaylist', UserPlaylistSchema)
module.exports = UserPlaylist
