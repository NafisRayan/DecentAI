const mongoose = require('mongoose');

const TransactionSchema = new mongoose.Schema({
    id: { type: Number, unique: true }, // Keeping 'id' for consistency with db.json
    senderId: { type: Number, required: true },
    receiverId: { type: Number, required: true },
    amount: { type: Number, required: true },
    timestamp: { type: Date, default: Date.now }
}, { timestamps: true });

module.exports = mongoose.model('Transaction', TransactionSchema);