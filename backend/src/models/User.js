const mongoose = require('mongoose');

const UserSchema = new mongoose.Schema({
    email: { type: String, required: true, unique: true },
    password: { type: String }, // Optional for Google Auth users
    googleId: { type: String },
    name: { type: String, required: true },
    avatar: { type: String },
}, { timestamps: true });

module.exports = mongoose.model('User', UserSchema);
