const mongoose = require("mongoose");
const { CLASS_UPCOMING } = require("../../enums/class_status");

const classModeSchema = new mongoose.Schema({
	class_name: String,
	class_desc: String,
	teacher_id: Number,
	start_time: mongoose.Schema.Types.Date,
	end_time: mongoose.Schema.Types.Date,
	status: {
		type: String,
		default: CLASS_UPCOMING,
	},
	has_teacher_joined: {
		type: Boolean,
		default: false,
	},
	allowed_students: {
		type: [String],
		default: [],
	},
	attendees: {
		type: [String],
		default: [],
	},
	actions_queue: {
		type: mongoose.Schema.Types.Mixed,
		default: [],
	},
	controls_queue: {
		type: mongoose.Schema.Types.Mixed,
		default: [],
	},
	created_at: {
		type: Date,
		default: Date.now,
	},
	updated_at: {
		type: Date,
		default: Date.now,
	},
});

const ClassMode = mongoose.model("ClassMode", classModeSchema, "class_mode");

module.exports = ClassMode;
