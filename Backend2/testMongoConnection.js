const mongoose = require('mongoose');

const mongoURI = 'mongodb+srv://vaugheu:tempA@cluster0.yfpgp8o.mongodb.net/?retryWrites=true&w=majority&appName=Cluster0';

mongoose.connect(mongoURI, { connectTimeoutMS: 30000 })
    .then(() => {
        console.log('MongoDB connection successful!');
        mongoose.connection.close();
        process.exit(0);
    })
    .catch(err => {
        console.error('MongoDB connection failed:', err);
        process.exit(1);
    });