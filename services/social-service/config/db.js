const mongoose = require('mongoose');

const connectDB = async () => {
  const mongoUri = process.env.MONGO_URI;
  if (!mongoUri) {
    console.warn('MONGO_URI is not set; social-service DB not connected');
    return;
  }

  try {
    mongoose.set('bufferCommands', false);
    const conn = await mongoose.connect(mongoUri, {
      serverSelectionTimeoutMS: 5000,
    });
    console.log(`Social Service DB Connected: ${conn.connection.host}`);
  } catch (error) {
    console.error(`Social Service DB connection failed: ${error.message}`);
  }
};

module.exports = connectDB;
