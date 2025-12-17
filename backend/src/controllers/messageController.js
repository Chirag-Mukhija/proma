const Message = require('../models/Message');

const getMessages = async (req, res) => {
    try {
        const messages = await Message.find({ project: req.params.projectId })
            .populate('sender', 'name avatar email')
            .sort({ createdAt: 1 }); // Oldest first
        res.status(200).json(messages);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

module.exports = { getMessages };
