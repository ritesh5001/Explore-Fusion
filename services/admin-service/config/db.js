const mongoose = require('mongoose');

const connectDb = async () => {
  const authUri = process.env.AUTH_MONGO_URI || process.env.MONGO_URI;
  const bookingUri = process.env.BOOKING_MONGO_URI || process.env.MONGO_URI;

  if (!authUri) {
		throw new Error(
			'AUTH_MONGO_URI (or MONGO_URI) is missing. Set this in the admin-service environment on Render.'
		);
  }
  if (!bookingUri) {
		throw new Error(
			'BOOKING_MONGO_URI (or MONGO_URI) is missing. Set this in the admin-service environment on Render.'
		);
  }

  const authConn = mongoose.createConnection(authUri);
  const bookingConn = mongoose.createConnection(bookingUri);

  await Promise.all([authConn.asPromise(), bookingConn.asPromise()]);

  return { authConn, bookingConn };
};

module.exports = { connectDb };
