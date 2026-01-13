const mongoose = require('mongoose');

const ItinerarySchema = new mongoose.Schema({
  userId: { type: String, required: true },
  plan: { type: Object, required: true }, 
}, { timestamps: true });

module.exports = mongoose.model('Itinerary', ItinerarySchema);