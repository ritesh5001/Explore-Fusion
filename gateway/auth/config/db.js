const mongoose = require('mongoose');

const connectDB = async () => {
  const uri = process.env.AUTH_MONGO_URI || process.env.MONGO_URI;
  if (!uri) {
    console.error('Missing AUTH_MONGO_URI (or MONGO_URI) for auth module');
    process.exit(1);
  }

  try {
    const conn = await mongoose.connect(uri);
    console.log(`Auth MongoDB connected: ${conn.connection.host}`);
  } catch (error) {
    console.error(`Error connecting to auth MongoDB: ${error.message}`);
    process.exit(1);
  }
};

module.exports = connectDB;
