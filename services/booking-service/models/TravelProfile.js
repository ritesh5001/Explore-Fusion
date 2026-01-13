const mongoose = require('mongoose');

const travelProfileSchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
      unique: true,
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

module.exports = mongoose.model('TravelProfile', travelProfileSchema);
