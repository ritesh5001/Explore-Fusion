const mongoose = require('mongoose');

const travelProfileSchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
      unique: true,
      index: true,
    },
    destinationPreferences: {
      type: [String],
      default: [],
    },
    interests: {
      type: [String],
      default: [],
    },
    travelStyle: {
      type: String,
      enum: ['budget', 'luxury', 'adventure'],
    },
    bio: {
      type: String,
      trim: true,
      maxlength: 500,
    },
  },
  { timestamps: true }
);

const matchSchema = new mongoose.Schema(
  {
    requesterId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    receiverId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    status: {
      type: String,
      enum: ['pending', 'accepted', 'rejected'],
      default: 'pending',
      required: true,
    },
    matchedAt: {
      type: Date,
    },
  },
  { timestamps: true }
);

matchSchema.index({ requesterId: 1, receiverId: 1 }, { unique: true });
matchSchema.index({ receiverId: 1, status: 1 });

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
    title: {
      type: String,
      required: true,
      trim: true,
      maxlength: 120,
    },
    message: {
      type: String,
      required: true,
      trim: true,
      maxlength: 500,
    },
    link: {
      type: String,
      trim: true,
    },
    isRead: {
      type: Boolean,
      default: false,
      index: true,
    },
  },
  { timestamps: true }
);

notificationSchema.index({ userId: 1, isRead: 1, createdAt: -1 });

const createModel = (conn, name, schema) => {
  if (!conn) {
    throw new Error('Matches connection is required to initialize models');
  }
  return conn.models[name] || conn.model(name, schema);
};

const initModels = ({ matchesConn }) => {
  if (!matchesConn) {
    throw new Error('matchesConn is required to initialize matches models');
  }

  const TravelProfile = createModel(matchesConn, 'TravelProfile', travelProfileSchema);
  const Match = createModel(matchesConn, 'Match', matchSchema);
  const Notification = createModel(matchesConn, 'Notification', notificationSchema);

  return { TravelProfile, Match, Notification };
};

module.exports = { initModels };
