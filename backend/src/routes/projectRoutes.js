const express = require('express');
const router = express.Router();
const {
    createProject,
    getProjects,
    getProjectById,
    requestJoin,
    acceptInvite,
    makeAdmin,
    updateProject
} = require('../controllers/projectController');
const { protect } = require('../middleware/authMiddleware');

router.route('/')
    .post(protect, createProject)
    .get(protect, getProjects);

router.get('/:id', protect, getProjectById);

router.post('/:id/join', protect, requestJoin);
router.post('/:id/accept-invite', protect, acceptInvite);
router.post('/:id/make-admin', protect, makeAdmin);
router.put('/:id', protect, updateProject);

module.exports = router;
