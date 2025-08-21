const express = require('express');
const router = express.Router();
const Chat = require('../models/Chat');
const auth = require('../middleware/auth'); // Auth middleware

// Get all chats (protected route)
router.get('/', auth, async (req, res) => {
    try {
        const chats = await Chat.find();
        res.json(chats);
    } catch (err) {
        console.error(err.message);
        res.status(500).send('Server Error');
    }
});

// Create a new chat message (protected route)
router.post('/', auth, async (req, res) => {
    const { roomId, userId, message } = req.body;

    try {
        // Assign a new ID based on the max existing ID
        const chatId = (await Chat.countDocuments()) > 0 ? (await Chat.find().sort({ id: -1 }).limit(1))[0].id + 1 : 1;

        const newChat = new Chat({
            id: chatId,
            roomId,
            userId,
            message,
            timestamp: new Date()
        });

        await newChat.save();
        res.json(newChat);
    } catch (err) {
        console.error(err.message);
        res.status(500).send('Server Error');
    }
});

module.exports = router;