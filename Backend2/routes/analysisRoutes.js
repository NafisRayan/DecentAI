const express = require('express');
const router = express.Router();
const AnalysisHistory = require('../models/AnalysisHistory');
const auth = require('../middleware/auth'); // Auth middleware

// Save analysis history (protected route)
router.post('/', auth, async (req, res) => {
    const { text, sentiment, confidence, score, timestamp } = req.body;

    try {
        // Assign a new ID based on the max existing ID
        const analysisId = (await AnalysisHistory.countDocuments()) > 0 ? (await AnalysisHistory.find().sort({ id: -1 }).limit(1))[0].id + 1 : 1;

        const newAnalysis = new AnalysisHistory({
            id: analysisId,
            text,
            sentiment,
            confidence,
            score,
            timestamp: timestamp ? new Date(timestamp) : new Date()
        });

        await newAnalysis.save();
        res.json(newAnalysis);
    } catch (err) {
        console.error(err.message);
        res.status(500).send('Server Error');
    }
});

// Get analysis history (protected route)
router.get('/', auth, async (req, res) => {
    try {
        const analysisHistory = await AnalysisHistory.find();
        res.json(analysisHistory);
    } catch (err) {
        console.error(err.message);
        res.status(500).send('Server Error');
    }
});

// Clear analysis history (protected route)
router.delete('/', auth, async (req, res) => {
    try {
        await AnalysisHistory.deleteMany({});
        res.json({ msg: 'Analysis history cleared' });
    } catch (err) {
        console.error(err.message);
        res.status(500).send('Server Error');
    }
});

module.exports = router;