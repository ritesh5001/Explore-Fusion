const { connectBookingDb } = require('./config/db');
const { initModels } = require('./models/initModels');
const { makeBookingController } = require('./controllers/bookingController');
const { makePackageController } = require('./controllers/packageController');
const { makeItineraryController } = require('./controllers/itineraryController');
const { makeReviewController } = require('./controllers/reviewController');
const { makeBookingRoutes } = require('./routes/bookingRoutes');
const { makePackageRoutes } = require('./routes/packages');
const { makeItineraryRoutes } = require('./routes/itineraryRoutes');
const { makeReviewRoutes } = require('./routes/reviewRoutes');
const { protect, isSuperAdmin } = require('../auth/middleware/authMiddleware');

const initBooking = async () => {
  const bookingConn = await connectBookingDb();
  const models = initModels({ bookingConn });

  const bookingController = makeBookingController(models);
  const packageController = makePackageController(models);
  const itineraryController = makeItineraryController(models);
  const reviewController = makeReviewController(models);

  const auth = { protect, isSuperAdmin };

  return {
    bookingRouter: makeBookingRoutes({ controller: bookingController, auth }),
    packageRouter: makePackageRoutes({ controller: packageController, auth }),
    itineraryRouter: makeItineraryRoutes({ controller: itineraryController, auth }),
    reviewRouter: makeReviewRoutes({ controller: reviewController, auth }),
  };
};

module.exports = { initBooking };
