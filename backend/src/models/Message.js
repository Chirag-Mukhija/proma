const mongoose = require('mongoose');

const MessageSchema = new mongoose.Schema({
    content: { type: String, required: true },
    sender: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    project: { type: mongoose.Schema.Types.ObjectId, ref: 'Project', required: true },
}, { timestamps: true });

module.exports = mongoose.model('Message', MessageSchema);
