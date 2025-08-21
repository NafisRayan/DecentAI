const mongoose = require('mongoose');
const fs = require('fs');
const path = require('path');

const User = require('./models/User');
const Transaction = require('./models/Transaction');
const Chat = require('./models/Chat');
const Poll = require('./models/Poll');
const AnalysisHistory = require('./models/AnalysisHistory');

const mongoURI = 'mongodb+srv://vaugheu:tempA@cluster0.yfpgp8o.mongodb.net/?retryWrites=true&w=majority&appName=Cluster0';
const dbPath = path.join(__dirname, '../Backend/data/db.json');

mongoose.connect(mongoURI, {
    connectTimeoutMS: 60000, // Increase connection timeout to 60 seconds
    socketTimeoutMS: 60000,  // Increase socket timeout to 60 seconds
    useNewUrlParser: true,
    useUnifiedTopology: true
})
    .then(() => console.log('MongoDB connected for data import'))
    .catch(err => {
        console.error('MongoDB connection error:', err);
        process.exit(1);
    });

const importData = async () => {
    try {
        const rawData = fs.readFileSync(dbPath, 'utf8');
        const data = JSON.parse(rawData);

        // Clear existing data (optional, but good for clean imports)
        // await User.deleteMany({});
        // await Transaction.deleteMany({});
        // await Chat.deleteMany({});
        // await Poll.deleteMany({});
        // await AnalysisHistory.deleteMany({});
        // console.log('Existing data cleared.');

        // Insert data
        await User.insertMany(data.users);
        await Transaction.insertMany(data.transactions);
        await Chat.insertMany(data.chats);
        await Poll.insertMany(data.polls);
        await AnalysisHistory.insertMany(data.analysisHistory);

        console.log('Data imported successfully!');
        process.exit();
    } catch (error) {
        console.error('Error importing data:', error);
        process.exit(1);
    }
};

importData();