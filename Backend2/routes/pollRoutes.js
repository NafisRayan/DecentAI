const express = require('express');
const router = express.Router();
const Poll = require('../models/Poll');
const auth = require('../middleware/auth'); // Auth middleware

// Get all polls (protected route)
router.get('/', auth, async (req, res) => {
    try {
        const polls = await Poll.find();
        res.json(polls);
    } catch (err) {
        console.error(err.message);
        res.status(500).send('Server Error');
    }
});

// Create a new poll (protected route)
router.post('/', auth, async (req, res) => {
    const { title, options } = req.body;

    try {
        // Assign a new ID based on the max existing ID
        const pollId = (await Poll.countDocuments()) > 0 ? (await Poll.find().sort({ id: -1 }).limit(1))[0].id + 1 : 1;

        const newPoll = new Poll({
            id: pollId,
            title,
            options,
            votes: options.reduce((acc, option) => ({ ...acc, [option]: 0 }), {}), // Initialize votes
            active: true
        });

        await newPoll.save();
        res.json(newPoll);
    } catch (err) {
        console.error(err.message);
        res.status(500).send('Server Error');
    }
});

// Vote on a poll (protected route)
router.post('/:poll_id/vote', auth, async (req, res) => {
    const { userId, option } = req.body;

    try {
        const poll = await Poll.findOne({ id: req.params.poll_id });

        if (!poll) {
            return res.status(404).json({ msg: 'Poll not found' });
        }

        if (!poll.active) {
            return res.status(400).json({ msg: 'Poll is closed' });
        }

        if (poll.voters.includes(userId)) {
            return res.status(400).json({ msg: 'User has already voted' });
        }

        if (!poll.options.includes(option)) {
            return res.status(400).json({ msg: 'Invalid option' });
        }

        poll.votes.set(option, poll.votes.get(option) + 1); // Increment vote for the option
        poll.voters.push(userId); // Add user to voters list

        await poll.save();
        res.json(poll);
    } catch (err) {
        console.error(err.message);
        res.status(500).send('Server Error');
    }
});

module.exports = router;