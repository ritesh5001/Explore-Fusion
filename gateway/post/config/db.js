const mongoose = require('mongoose');

const connectPostsDb = async () => {
  const uri = process.env.POST_MONGO_URI || process.env.MONGO_URI;
  if (!uri) {
    throw new Error('Missing POST_MONGO_URI (or MONGO_URI) for post routes');
  }

  try {
    const conn = mongoose.createConnection(uri);
    await conn.asPromise();
    console.log('Post DB connected');
    return conn;
  } catch (error) {
    console.error('Post DB connection error:', error);
    throw error;
  }
};

module.exports = { connectPostsDb };
