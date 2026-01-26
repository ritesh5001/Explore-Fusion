const mongoose = require('mongoose');

const bookingSchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
      index: true,
    },
    packageId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Package',
      required: true,
      index: true,
    },
    creatorId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      index: true,
    },
    status: {
      type: String,
      enum: ['pending', 'confirmed', 'cancelled'],
      default: 'pending',
      index: true,
    },
    guests: {
      type: Number,
      default: 1,
      min: 1,
    },
    totalPrice: {
      type: Number,
      required: true,
      min: 0,
    },
    cancelledAt: {
      type: Date,
      default: null,
    },
  },
  { timestamps: true }
);

const packageSchema = new mongoose.Schema(
  {
    title: { type: String, required: true, trim: true },
    description: { type: String, required: true, trim: true },
    destination: { type: String, required: true, trim: true, index: true },
    price: { type: Number, required: true, min: 0 },
    duration: { type: String, required: true, trim: true },
    images: [{ type: String }],
    creatorId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
      index: true,
    },
  },
  { timestamps: true }
);

const itinerarySchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
      index: true,
    },
    destination: { type: String, required: true, trim: true },
    duration: { type: Number, required: true, min: 1 },
    budget: { type: Number, required: true, min: 0 },
    total_cost: { type: Number, min: 0 },
    currency: { type: String, required: true, trim: true },
    activities: [
      {
        day: { type: Number, required: true, min: 1 },
        activity: { type: String, required: true, trim: true },
        cost: { type: Number, required: true, min: 0 },
      },
    ],
    note: { type: String, trim: true },
  },
  { timestamps: true }
);

itinerarySchema.index({ userId: 1, createdAt: -1 });

const reviewSchema = new mongoose.Schema(
  {
    userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true, index: true },
    packageId: { type: mongoose.Schema.Types.ObjectId, ref: 'Package', required: true, index: true },
    rating: { type: Number, required: true, min: 1, max: 5 },
    comment: { type: String, required: true, trim: true },
  },
  { timestamps: true }
);

reviewSchema.index({ packageId: 1, createdAt: -1 });
reviewSchema.index({ userId: 1, packageId: 1 }, { unique: true });

const notificationSchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
      index: true,
    },
    type: {
      type: String,
      required: true,
      enum: [
        'match_request',
        'match_accepted',
        'booking_confirmed',
        'review_added',
        'admin_action',
      ],
    },
    title: { type: String, required: true, trim: true, maxlength: 120 },
    message: { type: String, required: true, trim: true, maxlength: 500 },
    link: { type: String, trim: true },
    isRead: { type: Boolean, default: false, index: true },
  },
  { timestamps: true }
);

notificationSchema.index({ userId: 1, isRead: 1, createdAt: -1 });

const createModel = (conn, name, schema) => {
  if (!conn) {
    throw new Error('Booking connection is required to initialize models');
  }
  return conn.models[name] || conn.model(name, schema);
};

const initModels = ({ bookingConn }) => {
  if (!bookingConn) {
    throw new Error('bookingConn is required to initialize booking models');
  }

  const Booking = createModel(bookingConn, 'Booking', bookingSchema);
  const Package = createModel(bookingConn, 'Package', packageSchema);
  const Itinerary = createModel(bookingConn, 'Itinerary', itinerarySchema);
  const Review = createModel(bookingConn, 'Review', reviewSchema);
  const Notification = createModel(bookingConn, 'Notification', notificationSchema);

  return {
    Booking,
    Package,
    Itinerary,
    Review,
    Notification,
  };
};

module.exports = { initModels };
