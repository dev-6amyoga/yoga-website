const mongoose = require("mongoose");

const videoRecordingsSchema = new mongoose.Schema({
	user_id: Number,
	user_username: String,
	folder_name: String,
	processing_status: { type: String, default: "PENDING" },
	created_at: {
		type: Date,
		default: Date.now,
	},
});

const VideoRecordings = mongoose.model(
	"VideoRecordings",
	videoRecordingsSchema,
	"video_recordings"
);

module.exports = VideoRecordings;
