const mongoose = require('mongoose');

const PlaylistSchema6am = new mongoose.Schema({
    playlist_id: { type: Number, required: true },
    playlist_name: String,
    asana_ids: [Number],
});

const Playlist = mongoose.model(
    'Playlists',
    PlaylistSchema6am,
    '6amyoga_playlists'
);

module.exports = Playlist;
