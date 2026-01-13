const mongoose = require('mongoose');

const BookingSchema = new mongoose.Schema({
  userId: { type: String, required: true }, 
  packageId: { type: mongoose.Schema.Types.ObjectId, ref: 'Package' },
  status: { type: String, default: 'pending', enum: ['pending', 'confirmed', 'cancelled'] },
  date: Date,
  guests: Number,
  totalPrice: Number,
}, { timestamps: true });

module.exports = mongoose.model('Booking', BookingSchema);