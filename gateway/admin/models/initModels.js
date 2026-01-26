const mongoose = require('mongoose');

const initModels = ({ bookingConn }) => {
  if (!bookingConn) {
    throw new Error('Booking connection is required to initialize admin models');
  }

  const bookingSchema = new mongoose.Schema(
    {
      userId: { type: mongoose.Schema.Types.ObjectId, required: true },
      packageId: { type: mongoose.Schema.Types.ObjectId, required: true },
      creatorId: { type: mongoose.Schema.Types.ObjectId },
      status: { type: String, enum: ['pending', 'confirmed', 'cancelled'], default: 'pending' },
      guests: { type: Number, default: 1 },
      totalPrice: { type: Number, default: 0 },
    },
    { timestamps: true }
  );

  const packageSchema = new mongoose.Schema(
    {
      title: String,
      description: String,
      destination: String,
      price: Number,
      duration: String,
      images: [String],
      creatorId: String,
    },
    { timestamps: true }
  );

  const itinerarySchema = new mongoose.Schema(
    {
      userId: String,
      plan: Object,
    },
    { timestamps: true }
  );

  const Booking = bookingConn.models.Booking || bookingConn.model('Booking', bookingSchema);
  const Package = bookingConn.models.Package || bookingConn.model('Package', packageSchema);
  const Itinerary = bookingConn.models.Itinerary || bookingConn.model('Itinerary', itinerarySchema);

  return { Booking, Package, Itinerary };
};

module.exports = { initModels };
