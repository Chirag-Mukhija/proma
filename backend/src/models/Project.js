const mongoose = require('mongoose');

const ProjectSchema = new mongoose.Schema({
    title: { type: String, required: true },
    description: { type: String },
    status: {
        type: String,
        enum: ['planning', 'in-progress', 'completed'],
        default: 'planning'
    },
    admins: [{ type: mongoose.Schema.Types.ObjectId, ref: 'User' }], // Array of admins
    // Keeping 'admin' for backward compatibility or migration if needed, but primary logic will move to 'admins'
    // Actually, let's just replace it.
    members: [{ type: mongoose.Schema.Types.ObjectId, ref: 'User' }],
    joinRequests: [{ type: mongoose.Schema.Types.ObjectId, ref: 'User' }],
}, { timestamps: true });

module.exports = mongoose.model('Project', ProjectSchema);
