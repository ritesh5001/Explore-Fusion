const { connectMatchesDb } = require('./config/db');
const { initModels } = require('./models/initModels');
const { makeBuddyController } = require('./controllers/buddyController');
const { makeBuddyRoutes } = require('./routes/buddyRoutes');
const { protect } = require('../auth/middleware/authMiddleware');

const initMatches = async () => {
  const matchesConn = await connectMatchesDb();
  const models = initModels({ matchesConn });
  const controller = makeBuddyController({ models });
  const auth = { protect };
  return makeBuddyRoutes({ controller, auth });
};

module.exports = { initMatches };
