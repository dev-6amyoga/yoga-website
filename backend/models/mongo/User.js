const mongoose = require('mongoose');

const userSchema = new mongoose.Schema({
    user_id: Number,
    user_name: String,
    creation_date: Date,
    phone_number: String,
    email_id: String,
    username: String,
    password: String,
    user_type: String,
    institute_id: Number,
    institute_name: String,
});

const User = mongoose.model('Users', userSchema, 'all_users');

module.exports = User;
