const mongoose = require('mongoose');

const connectSocialDb = async () => {
  const uri = process.env.SOCIAL_MONGO_URI || process.env.MONGO_URI;
  if (!uri) {
    throw new Error('Missing SOCIAL_MONGO_URI (or MONGO_URI) for social routes');
  }

  const readyState = mongoose.connection.readyState;
  if (readyState === 1) {
    console.log('Social module reuses existing mongoose connection');
    return mongoose.connection;
  }
  if (readyState === 2) {
    await mongoose.connection.asPromise();
    console.log('Social module waited for existing mongoose connection');
    return mongoose.connection;
  }

  await mongoose.connect(uri);
  console.log('Social DB connected');
  return mongoose.connection;
};

module.exports = { connectSocialDb };
