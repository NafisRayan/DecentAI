const mongoose = require('mongoose');

const PollSchema = new mongoose.Schema({
    id: { type: Number, unique: true }, // Keeping 'id' for consistency with db.json
    title: { type: String, required: true },
    options: [{ type: String, required: true }],
    votes: { type: Map, of: Number, default: {} },
    voters: [{ type: Number }], // Array of user IDs who voted
    active: { type: Boolean, default: true }
}, { timestamps: true });

module.exports = mongoose.model('Poll', PollSchema);