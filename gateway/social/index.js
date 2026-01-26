const { connectSocialDb } = require('./config/db');
const followRoutes = require('./routes/followRoutes');

const initSocial = async () => {
  await connectSocialDb();
  return followRoutes;
};

module.exports = { initSocial };