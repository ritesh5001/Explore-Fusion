const mongoose = require('mongoose');

const bookingSchema = new mongoose.Schema({
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
    required: true,
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

}, { timestamps: true });

module.exports = mongoose.model('Booking', bookingSchema);