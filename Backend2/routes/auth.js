const express = require('express');
const router = express.Router();
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const User = require('../models/User'); // Assuming User model is defined

// Secret key for JWT - ideally from environment variables
const JWT_SECRET = 'your-jwt-secret'; // TODO: Replace with a strong, secure secret from environment variables

// Register
router.post('/register', async (req, res) => {
    const { username, email, password } = req.body;

    try {
        let user = await User.findOne({ email });
        if (user) {
            return res.status(400).json({ msg: 'User already exists' });
        }

        user = new User({
            username,
            email,
            password,
            // Assigning a new ID based on the max existing ID, if any
            id: (await User.countDocuments()) > 0 ? (await User.find().sort({ id: -1 }).limit(1))[0].id + 1 : 1
        });

        const salt = await bcrypt.genSalt(10);
        user.password = await bcrypt.hash(password, salt);

        await user.save();

        const payload = {
            user: {
                id: user.id
            }
        };

        jwt.sign(
            payload,
            JWT_SECRET,
            { expiresIn: '1h' },
            (err, token) => {
                if (err) throw err;
                res.json({ token, user: { id: user.id, username: user.username, email: user.email, points: user.points, avatar: user.avatar } });
            }
        );

    } catch (err) {
        console.error(err.message);
        res.status(500).send('Server error');
    }
});

// Login
router.post('/login', async (req, res) => {
    const { username, password } = req.body;

    try {
        let user = await User.findOne({ username });
        if (!user) {
            return res.status(400).json({ msg: 'Invalid Credentials' });
        }

        const isMatch = await bcrypt.compare(password, user.password);
        if (!isMatch) {
            return res.status(400).json({ msg: 'Invalid Credentials' });
        }

        const payload = {
            user: {
                id: user.id
            }
        };

        jwt.sign(
            payload,
            JWT_SECRET,
            { expiresIn: '1h' },
            (err, token) => {
                if (err) throw err;
                res.json({ token, user: { id: user.id, username: user.username, email: user.email, points: user.points, avatar: user.avatar } });
            }
        );

    } catch (err) {
        console.error(err.message);
        res.status(500).send('Server error');
    }
});

// Logout (client-side token removal)
// For stateless JWT, logout is typically handled by the client discarding the token.
// However, a simple endpoint can be provided for consistency or future blacklist implementation.
router.post('/logout', (req, res) => {
    // In a stateless JWT system, logout is often handled client-side by deleting the token.
    // This endpoint can be used for logging purposes or if a token blacklist is implemented.
    res.json({ msg: 'Logged out successfully (token should be discarded by client)' });
});

module.exports = router;