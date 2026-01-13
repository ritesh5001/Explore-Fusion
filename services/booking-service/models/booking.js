const mongoose = require('mongoose');

const bookingSchema = new mongoose.Schema({
  userId: { type: String, required: true },
  packageId: { type: mongoose.Schema.Types.ObjectId, ref: 'Package' },
  creatorId: { type: String },
  status: { type: String, default: 'pending' },
  guests: Number,
  totalPrice: Number
}, { timestamps: true });

module.exports = mongoose.model('Booking', bookingSchema);