const mongoose = require('mongoose');

const connectDB = async () => {
  const uri = process.env.MONGO_URI;
  if (!uri) {
    throw new Error('MONGO_URI is missing. Set this in the gateway environment.');
  }

  const readyState = mongoose.connection.readyState;
  if (readyState === 1) {
    return mongoose.connection;
  }

  if (readyState === 2) {
    await mongoose.connection.asPromise();
    return mongoose.connection;
  }

  const conn = await mongoose.connect(uri);
  console.log(`MongoDB connected: ${conn.connection.host}`);
  return conn.connection;
};

module.exports = connectDB;