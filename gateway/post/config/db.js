const mongoose = require('mongoose');

const connectPostsDb = async () => {
  const uri = process.env.POST_MONGO_URI || process.env.MONGO_URI;
  if (!uri) {
    throw new Error('Missing POST_MONGO_URI (or MONGO_URI) for post routes');
  }

  const readyState = mongoose.connection.readyState;
  if (readyState === 1) {
    console.log('Post module reuses existing mongoose connection');
    return mongoose.connection;
  }
  if (readyState === 2) {
    await mongoose.connection.asPromise();
    console.log('Post module waited for existing mongoose connection');
    return mongoose.connection;
  }

  await mongoose.connect(uri);
  console.log('Post DB connected');
  return mongoose.connection;
};

module.exports = { connectPostsDb };
