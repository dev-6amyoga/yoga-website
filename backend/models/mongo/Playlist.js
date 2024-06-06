const mongoose = require("mongoose");

const PlaylistSchema6am = new mongoose.Schema({
	playlist_id: { type: Number, required: true },
	playlist_name: String,
	asana_ids: [mongoose.Schema.Types.Mixed],
	playlist_dash_url: String,
	duration: Number,
	playist_mode: String,
	sections: [
		{
			name: String,
			time: Number,
		},
	],
});

const Playlist = mongoose.model(
	"Playlists",
	PlaylistSchema6am,
	"6amyoga_playlists"
);

module.exports = Playlist;
