const mongoose = require('mongoose');

const BookingSchema = new mongoose.Schema({
  user_id: { type: String, required: true },
  package_id: { type: String, required: true },
  status: { type: String, default: 'pending' },
  createdAt: { type: Date, default: Date.now }
});

module.exports = mongoose.model('Booking', BookingSchema);