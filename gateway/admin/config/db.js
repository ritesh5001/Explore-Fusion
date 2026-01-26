const mongoose = require('mongoose');

const connectBookingDb = async () => {
  const uri = process.env.BOOKING_MONGO_URI || process.env.MONGO_URI;
  if (!uri) {
    throw new Error('BOOKING_MONGO_URI (or MONGO_URI) is missing. Set this in the gateway environment.');
  }

  try {
    const connection = mongoose.createConnection(uri);
    await connection.asPromise();
    console.log('Admin booking MongoDB connected');
    return connection;
  } catch (error) {
    console.error('Error connecting to booking MongoDB for admin module:', error.message || error);
    throw error;
  }
};

module.exports = { connectBookingDb };
