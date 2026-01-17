const mongoose = require('mongoose');
const connectDB = async () => {
    const uri = process.env.AUTH_MONGO_URI || process.env.MONGO_URI;
    if (!uri) {
        console.error('Missing AUTH_MONGO_URI (or MONGO_URI) in auth-service environment');
        process.exit(1);
    }

    try {
        const conn = await mongoose.connect(uri);
        console.log(`MongoDB Connected: ${conn.connection.host}`);
    } catch (error) {
        console.error(`Error: ${error.message}`);
        process.exit(1);
    }
};

module.exports = connectDB;