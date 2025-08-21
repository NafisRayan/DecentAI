const mongoose = require('mongoose');

const UserSchema = new mongoose.Schema({
    username: { type: String, required: true, unique: true },
    email: { type: String, required: true, unique: true },
    password: { type: String, required: true },
    id: { type: Number, unique: true }, // Keeping 'id' for consistency with db.json, though MongoDB uses _id
    points: { type: Number, default: 0 },
    avatar: { type: String, default: '/default-avatar.png' }
}, { timestamps: true });

module.exports = mongoose.model('User', UserSchema);