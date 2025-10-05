const mongoose = require('mongoose');

module.exports = async function connectDB() {
    const uri = process.env.MONGODB_URI || 'mongodb://localhost:27017/blogging-api';
    try {
        await mongoose.connect(uri, {
          
        });
        console.log('MongoDB connected');
    } catch (err) {
        console.error('Failed to connect DB:', err);
        process.exit(1); // stop the server if DB connection fails
    }
};
