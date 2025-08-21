const mongoose = require('mongoose');

const AnalysisHistorySchema = new mongoose.Schema({
    id: { type: Number, unique: true }, // Keeping 'id' for consistency with db.json
    text: { type: String, required: true },
    sentiment: { type: String, required: true },
    confidence: { type: Number, required: true },
    score: { type: Number, required: true },
    timestamp: { type: Date, default: Date.now }
}, { timestamps: true });

module.exports = mongoose.model('AnalysisHistory', AnalysisHistorySchema);