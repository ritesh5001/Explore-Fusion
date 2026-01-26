const mongoose = require('mongoose');

const connectMatchesDb = async () => {
  const uri = process.env.MATCHES_MONGO_URI || process.env.MONGO_URI;
  if (!uri) {
    throw new Error('MATCHES_MONGO_URI (or MONGO_URI) is missing. Set this in the gateway environment.');
  }

  try {
    const connection = mongoose.createConnection(uri);
    await connection.asPromise();
    console.log('Matches MongoDB connected');
    return connection;
  } catch (error) {
    console.error('Error connecting to matches MongoDB:', error.message || error);
    throw error;
  }
};

module.exports = { connectMatchesDb };
