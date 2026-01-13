const mongoose = require('mongoose');

const initModels = ({ authConn, bookingConn }) => {
  const userSchema = new mongoose.Schema(
    {
      name: { type: String, required: true },
      email: { type: String, required: true, unique: true, lowercase: true, trim: true },
      password: { type: String, required: true, select: false },
      role: {
        type: String,
        enum: ['user', 'creator', 'admin', 'superadmin'],
        default: 'user',
      },
      isBlocked: { type: Boolean, default: false },
      isVerifiedCreator: { type: Boolean, default: false },
    },
    { timestamps: true }
  );

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

  const User = authConn.models.User || authConn.model('User', userSchema);
  const Booking = bookingConn.models.Booking || bookingConn.model('Booking', bookingSchema);
  const Package = bookingConn.models.Package || bookingConn.model('Package', packageSchema);
  const Itinerary = bookingConn.models.Itinerary || bookingConn.model('Itinerary', itinerarySchema);

  return { User, Booking, Package, Itinerary };
};

module.exports = { initModels };
