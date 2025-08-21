const express = require('express');
const router = express.Router();
const Transaction = require('../models/Transaction');
const User = require('../models/User');
const auth = require('../middleware/auth'); // Auth middleware

// Get transactions for a specific user (protected route)
router.get('/', auth, async (req, res) => {
    try {
        const userId = req.query.userId; // Assuming userId is passed as a query parameter
        if (!userId) {
            return res.status(400).json({ msg: 'userId is required' });
        }

        const userTransactions = await Transaction.find({
            $or: [{ senderId: userId }, { receiverId: userId }]
        });

        res.json(userTransactions);
    } catch (err) {
        console.error(err.message);
        res.status(500).send('Server Error');
    }
});

// Create a new transaction (protected route)
router.post('/', auth, async (req, res) => {
    const { senderId, receiverId, amount } = req.body;

    try {
        // Validate sender has enough points
        const sender = await User.findOne({ id: senderId });
        if (!sender || sender.points < amount) {
            return res.status(400).json({ msg: 'Insufficient points or sender not found' });
        }

        // Update sender's points
        sender.points -= amount;
        await sender.save();

        // Update receiver's points
        const receiver = await User.findOne({ id: receiverId });
        if (receiver) {
            receiver.points += amount;
            await receiver.save();
        }

        // Assign a new ID based on the max existing ID
        const transactionId = (await Transaction.countDocuments()) > 0 ? (await Transaction.find().sort({ id: -1 }).limit(1))[0].id + 1 : 1;

        const newTransaction = new Transaction({
            id: transactionId,
            senderId,
            receiverId,
            amount,
            timestamp: new Date()
        });

        await newTransaction.save();
        res.json(newTransaction);

    } catch (err) {
        console.error(err.message);
        res.status(500).send('Server Error');
    }
});

// Get all transactions (for analytics, protected route)
router.get('/analytics/transactions', auth, async (req, res) => {
    try {
        const transactions = await Transaction.find();
        res.json(transactions);
    } catch (err) {
        console.error(err.message);
        res.status(500).send('Server Error');
    }
});

module.exports = router;