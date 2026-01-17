const mongoose = require('mongoose');

const connectDB = async () => {
  const uri = process.env.POST_MONGO_URI || process.env.MONGO_URI;
  if (!uri) {
    console.error('Missing POST_MONGO_URI (or MONGO_URI) in post-service environment');
    process.exit(1);
  }

  try {
    await mongoose.connect(uri);
    console.log('Post Service DB Connected');
  } catch (err) {
    console.log(err.message);
    process.exit(1);
  }
};

module.exports = connectDB;
