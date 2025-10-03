const express = require('express');
const crypto = require('crypto');
const Project = require('../models/Project');
const User = require('../models/User');
const auth = require('../middleware/auth');

const router = express.Router();

// Generate share link
router.post('/generate-link/:projectId', auth, async (req, res) => {
    try {
        const project = await Project.findById(req.params.projectId);

        if (!project) {
            return res.status(404).json({ error: 'Project not found' });
        }

        if (!project.owner.equals(req.user._id)) {
            return res.status(403).json({ error: 'Only owner can generate share link' });
        }

        // Generate unique share link
        const shareToken = crypto.randomBytes(16).toString('hex');
        project.shareLink = shareToken;
        project.isPublic = true;
        await project.save();

        const shareUrl = `${process.env.CLIENT_URL || 'http://localhost:3000'}/share/${shareToken}`;

        res.json({ shareUrl, shareToken });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

// Access project via share link
router.get('/link/:shareToken', async (req, res) => {
    try {
        const project = await Project.findOne({ shareLink: req.params.shareToken })
            .populate('owner', 'username email');

        if (!project) {
            return res.status(404).json({ error: 'Invalid share link' });
        }

        res.json({ project });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

// Share with specific user
router.post('/user/:projectId', auth, async (req, res) => {
    try {
        const { email, permission } = req.body;

        const project = await Project.findById(req.params.projectId);
        if (!project) {
            return res.status(404).json({ error: 'Project not found' });
        }

        if (!project.owner.equals(req.user._id)) {
            return res.status(403).json({ error: 'Only owner can share project' });
        }

        const userToShare = await User.findOne({ email });
        if (!userToShare) {
            return res.status(404).json({ error: 'User not found' });
        }

        // Check if already shared
        const alreadyShared = project.sharedWith.some(
            share => share.user.equals(userToShare._id)
        );

        if (alreadyShared) {
            return res.status(400).json({ error: 'Already shared with this user' });
        }

        project.sharedWith.push({
            user: userToShare._id,
            permission: permission || 'view'
        });

        await project.save();

        res.json({ message: 'Project shared successfully', project });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

// Update user permission
router.patch('/permission/:projectId/:userId', auth, async (req, res) => {
    try {
        const { permission } = req.body;

        const project = await Project.findById(req.params.projectId);
        if (!project) {
            return res.status(404).json({ error: 'Project not found' });
        }

        if (!project.owner.equals(req.user._id)) {
            return res.status(403).json({ error: 'Only owner can change permissions' });
        }

        const shareIndex = project.sharedWith.findIndex(
            share => share.user.equals(req.params.userId)
        );

        if (shareIndex === -1) {
            return res.status(404).json({ error: 'User not found in shared list' });
        }

        project.sharedWith[shareIndex].permission = permission;
        await project.save();

        res.json({ message: 'Permission updated', project });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

// Remove user access
router.delete('/remove/:projectId/:userId', auth, async (req, res) => {
    try {
        const project = await Project.findById(req.params.projectId);
        if (!project) {
            return res.status(404).json({ error: 'Project not found' });
        }

        if (!project.owner.equals(req.user._id)) {
            return res.status(403).json({ error: 'Only owner can remove access' });
        }

        project.sharedWith = project.sharedWith.filter(
            share => !share.user.equals(req.params.userId)
        );

        await project.save();

        res.json({ message: 'Access removed', project });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

// Revoke share link
router.delete('/revoke-link/:projectId', auth, async (req, res) => {
    try {
        const project = await Project.findById(req.params.projectId);

        if (!project) {
            return res.status(404).json({ error: 'Project not found' });
        }

        if (!project.owner.equals(req.user._id)) {
            return res.status(403).json({ error: 'Only owner can revoke share link' });
        }

        project.shareLink = null;
        project.isPublic = false;
        await project.save();

        res.json({ message: 'Share link revoked' });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

module.exports = router;
