const Project = require('../models/Project');

// Create new project
const createProject = async (req, res) => {
    const { title, description, status } = req.body;

    try {
        const project = await Project.create({
            title,
            description,
            status,
            admins: [req.user._id],
            members: [req.user._id], // Admin is also a member
        });
        res.status(201).json(project);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// Get projects where user is member
const getProjects = async (req, res) => {
    try {
        // TEMP: Fetch ALL projects for demo visibility as requested
        const projects = await Project.find({})
            .populate('admins', 'name email')
            .populate('members', 'name email');
        res.status(200).json(projects);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// Get single project
const getProjectById = async (req, res) => {
    try {
        const project = await Project.findById(req.params.id)
            .populate('admins', 'name email')
            .populate('members', 'name email')
            .populate('joinRequests', 'name email'); // Populate join requests

        if (!project) return res.status(404).json({ message: 'Project not found' });
        res.status(200).json(project);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// Request to join a project
const requestJoin = async (req, res) => {
    try {
        const project = await Project.findById(req.params.id);
        if (!project) return res.status(404).json({ message: 'Project not found' });

        if (project.members.includes(req.user._id)) {
            return res.status(400).json({ message: 'Already a member' });
        }
        if (project.joinRequests.includes(req.user._id)) {
            return res.status(400).json({ message: 'Request already sent' });
        }

        project.joinRequests.push(req.user._id);
        await project.save();
        res.status(200).json({ message: 'Join request sent' });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// Accept invite (Admin only)
const acceptInvite = async (req, res) => {
    const { userId } = req.body; // ID of user to accept

    try {
        const project = await Project.findById(req.params.id);
        if (!project) return res.status(404).json({ message: 'Project not found' });

        const isAdmin = project.admins.some(adminId => adminId.toString() === req.user._id.toString());
        if (!isAdmin) {
            return res.status(401).json({ message: 'Not authorized as admin' });
        }

        if (!project.joinRequests.includes(userId)) {
            return res.status(400).json({ message: 'User has not requested to join' });
        }

        project.members.push(userId);
        project.joinRequests = project.joinRequests.filter(
            (id) => id.toString() !== userId
        );
        await project.save();
        res.status(200).json({ message: 'User accepted into project' });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// Make a user admin (Admin only)
const makeAdmin = async (req, res) => {
    const { userId } = req.body;
    try {
        const project = await Project.findById(req.params.id);
        if (!project) return res.status(404).json({ message: 'Project not found' });

        const isAdmin = project.admins.some(adminId => adminId.toString() === req.user._id.toString());
        if (!isAdmin) {
            return res.status(401).json({ message: 'Not authorized as admin' });
        }

        if (!project.members.includes(userId)) {
            return res.status(400).json({ message: 'User must be a member first' });
        }

        if (project.admins.includes(userId)) {
            return res.status(400).json({ message: 'User is already an admin' });
        }

        project.admins.push(userId);
        await project.save();
        res.status(200).json({ message: 'User promoted to admin', project });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// Update project details (Admin only)
const updateProject = async (req, res) => {
    const { title, description, status } = req.body;
    try {
        const project = await Project.findById(req.params.id);
        if (!project) return res.status(404).json({ message: 'Project not found' });

        const isAdmin = project.admins.some(adminId => adminId.toString() === req.user._id.toString());
        if (!isAdmin) {
            return res.status(401).json({ message: 'Not authorized as admin' });
        }

        if (title) project.title = title;
        if (description) project.description = description;
        if (status) project.status = status;

        await project.save();
        res.status(200).json(project);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

module.exports = { createProject, getProjects, getProjectById, requestJoin, acceptInvite, makeAdmin, updateProject };
