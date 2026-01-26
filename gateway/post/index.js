const { connectPostsDb } = require('./config/db');
const postRoutes = require('./routes/postRoutes');

const initPosts = async () => {
  await connectPostsDb();
  return postRoutes;
};

module.exports = { initPosts };
