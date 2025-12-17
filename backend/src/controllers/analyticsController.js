const Project = require('../models/Project');
const mongoose = require('mongoose');

const getUserAnalytics = async (req, res) => {
    try {
        const userId = new mongoose.Types.ObjectId(req.user._id);

        // 1. Project Distribution
        const statusDistribution = await Project.aggregate([
            { $match: { members: userId } },
            { $group: { _id: '$status', count: { $sum: 1 } } }
        ]);

        // 2. Team Reach (Unique users across all projects this user is a member of)
        const teamReach = await Project.aggregate([
            { $match: { members: userId } },
            { $unwind: '$members' },
            { $group: { _id: null, uniqueMembers: { $addToSet: '$members' } } },
            { $project: { count: { $size: '$uniqueMembers' } } }
        ]);

        // 3. Completion Rate
        const totalProjects = await Project.countDocuments({ members: userId });
        const completedProjects = await Project.countDocuments({ members: userId, status: 'completed' });
        const completionRate = totalProjects === 0 ? 0 : (completedProjects / totalProjects) * 100;

        res.status(200).json({
            distribution: statusDistribution,
            teamReach: teamReach.length > 0 ? teamReach[0].count : 0,
            completionRate: Math.round(completionRate * 10) / 10 // Round to 1 decimal
        });

    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

module.exports = { getUserAnalytics };
