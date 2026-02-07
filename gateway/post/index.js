const { connectPostsDb } = require('./config/db');
const { initPostModel } = require('./models/Post');
const { makePostController } = require('./controllers/postController');
const makePostRoutes = require('./routes/postRoutes');

const initPosts = async () => {
  const connection = await connectPostsDb();
  const Post = initPostModel(connection);
  const controller = makePostController({ Post });
  const postRoutes = makePostRoutes(controller);
  return postRoutes;
};

module.exports = { initPosts };
