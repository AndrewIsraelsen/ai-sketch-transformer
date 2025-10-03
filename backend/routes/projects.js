const express = require('express');
const Project = require('../models/Project');
const auth = require('../middleware/auth');

const router = express.Router();

// Get all user projects
router.get('/', auth, async (req, res) => {
    try {
        const projects = await Project.find({ owner: req.user._id })
            .sort({ updatedAt: -1 });
        res.json({ projects });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

// Get shared projects
router.get('/shared', auth, async (req, res) => {
    try {
        const projects = await Project.find({
            'sharedWith.user': req.user._id
        }).populate('owner', 'username email');
        res.json({ projects });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

// Get single project
router.get('/:id', auth, async (req, res) => {
    try {
        const project = await Project.findById(req.params.id)
            .populate('owner', 'username email')
            .populate('sharedWith.user', 'username email');

        if (!project) {
            return res.status(404).json({ error: 'Project not found' });
        }

        // Check if user has access
        const hasAccess = project.owner._id.equals(req.user._id) ||
                         project.sharedWith.some(share => share.user._id.equals(req.user._id)) ||
                         project.isPublic;

        if (!hasAccess) {
            return res.status(403).json({ error: 'Access denied' });
        }

        res.json({ project });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

// Create project
router.post('/', auth, async (req, res) => {
    try {
        const { title, layers, frames, thumbnail } = req.body;

        const project = new Project({
            title,
            owner: req.user._id,
            layers,
            frames,
            thumbnail
        });

        await project.save();
        res.status(201).json({ project });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

// Update project
router.patch('/:id', auth, async (req, res) => {
    try {
        const project = await Project.findById(req.params.id);

        if (!project) {
            return res.status(404).json({ error: 'Project not found' });
        }

        // Check permissions
        const canEdit = project.owner.equals(req.user._id) ||
                       project.sharedWith.some(share =>
                           share.user.equals(req.user._id) && share.permission === 'edit'
                       );

        if (!canEdit) {
            return res.status(403).json({ error: 'No permission to edit' });
        }

        const updates = req.body;
        Object.keys(updates).forEach(key => {
            project[key] = updates[key];
        });

        await project.save();
        res.json({ project });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

// Delete project
router.delete('/:id', auth, async (req, res) => {
    try {
        const project = await Project.findById(req.params.id);

        if (!project) {
            return res.status(404).json({ error: 'Project not found' });
        }

        if (!project.owner.equals(req.user._id)) {
            return res.status(403).json({ error: 'Only owner can delete project' });
        }

        await project.deleteOne();
        res.json({ message: 'Project deleted' });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

module.exports = router;
