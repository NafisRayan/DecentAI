const express = require('express');
const router = express.Router();
const User = require('../models/User'); // Assuming User model is defined
const auth = require('../middleware/auth'); // Auth middleware

// Get all users
router.get('/', async (req, res) => {
    try {
        const users = await User.find().select('-password'); // Exclude password from results
        res.json(users);
    } catch (err) {
        console.error(err.message);
        res.status(500).send('Server Error');
    }
});

// Get single user by ID
router.get('/:user_id', async (req, res) => {
    try {
        const user = await User.findOne({ id: req.params.user_id }).select('-password');
        if (!user) {
            return res.status(404).json({ msg: 'User not found' });
        }
        res.json(user);
    } catch (err) {
        console.error(err.message);
        res.status(500).send('Server Error');
    }
});

// Update user information (protected route)
router.put('/:user_id', auth, async (req, res) => {
    const { username, email } = req.body;

    // Check if the authenticated user is updating their own profile
    if (req.user.id !== parseInt(req.params.user_id)) {
        return res.status(401).json({ msg: 'Not authorized to update this user' });
    }

    try {
        let user = await User.findOne({ id: req.params.user_id });

        if (!user) {
            return res.status(404).json({ msg: 'User not found' });
        }

        // Update fields if provided
        if (username) user.username = username;
        if (email) user.email = email;

        await user.save();
        res.json(user);
    } catch (err) {
        console.error(err.message);
        res.status(500).send('Server Error');
    }
});

module.exports = router;