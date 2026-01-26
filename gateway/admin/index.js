const { connectBookingDb } = require('./config/db');
const { initModels } = require('./models/initModels');
const { makeAdminController } = require('./controllers/adminController');
const { makeAdminRoutes } = require('./routes/adminRoutes');
const { protect, isAdmin, isSuperAdmin } = require('../auth/middleware/authMiddleware');
const User = require('../auth/models/User');

const initAdmin = async () => {
  const bookingConn = await connectBookingDb();
  const models = initModels({ bookingConn });
  const controller = makeAdminController({ User, ...models });
  const auth = { protect, isAdmin, isSuperAdmin };
  return makeAdminRoutes({ auth, controller });
};

module.exports = { initAdmin };
