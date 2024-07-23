const mongoose = require("mongoose");
const { CLASS_UPCOMING } = require("../../enums/class_status");
const { CLASS_METADATA_DRAFT } = require("../../enums/class_metadata_status");
const {
	CLASS_RECURRANCE_TYPE_DAILY,
} = require("../../enums/class_metadata_recurrance_type");
const { CLASS_TYPE_ONETIME } = require("../../enums/class_metadata_class_type");

const classSchema = new mongoose.Schema({
	default_class_name: {
		type: mongoose.Schema.Types.String,
		required: true,
	},
	default_class_desc: {
		type: mongoose.Schema.Types.String,
	},
	teacher_id: {
		type: mongoose.Schema.Types.Number,
		required: true,
	},
	class_type: {
		type: mongoose.Schema.Types.String,
		default: CLASS_TYPE_ONETIME,
	},
	recurrance_type: {
		type: mongoose.Schema.Types.String,
		default: null,
	},
	recurrance_days: {
		type: [String],
		default: [],
	},
	recurring_class_start_time: {
		type: mongoose.Schema.Types.String,
		default: null,
	},
	recurring_class_end_time: {
		type: mongoose.Schema.Types.String,
		default: null,
	},
	status: {
		type: String,
		default: CLASS_METADATA_DRAFT,
	},
	default_allowed_students: {
		type: [String],
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

const Class = mongoose.model("Class", classSchema, "class");

module.exports = Class;
