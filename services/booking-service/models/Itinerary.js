const mongoose = require('mongoose');

const itinerarySchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
      index: true,
    },
    destination: {
      type: String,
      required: true,
      trim: true,
    },
    duration: {
      type: Number,
      required: true,
      min: 1,
    },
    budget: {
      type: Number,
      required: true,
      min: 0,
    },
    total_cost: {
      type: Number,
      min: 0,
    },
    currency: {
      type: String,
      required: true,
      trim: true,
    },
    activities: [
      {
        day: {
          type: Number,
          required: true,
          min: 1,
        },
        activity: {
          type: String,
          required: true,
          trim: true,
        },
        cost: {
          type: Number,
          required: true,
          min: 0,
        },
      },
    ],
    note: {
      type: String,
      trim: true,
    },
  },
  { timestamps: true }
);

itinerarySchema.index({ userId: 1, createdAt: -1 });

module.exports = mongoose.model('Itinerary', itinerarySchema);