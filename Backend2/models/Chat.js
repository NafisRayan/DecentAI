const mongoose = require('mongoose');

const ChatSchema = new mongoose.Schema({
    id: { type: Number, unique: true }, // Keeping 'id' for consistency with db.json
    roomId: { type: String, required: true },
    userId: { type: Number, required: true },
    message: { type: String, required: true },
    timestamp: { type: Date, default: Date.now }
}, { timestamps: true });

module.exports = mongoose.model('Chat', ChatSchema);