const mongoose = require("mongoose");

const TeacherPlaylistSchema = new mongoose.Schema({
  playlist_id: Number,
  user_id: Number,
  institute_id: Number,
  playlist_name: String,
  asana_ids: [Number],
  student_name: String,
  max_edit_count: Number,
  current_edit_count: Number,
});

const TeacherPlaylist = mongoose.model(
  "TeacherPlaylist",
  TeacherPlaylistSchema,
  "teacher_playlists"
);

module.exports = TeacherPlaylist;
