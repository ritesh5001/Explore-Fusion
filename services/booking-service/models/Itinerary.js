const mongoose = require('mongoose');

const itinerarySchema = new mongoose.Schema({
  userId: String,
  plan: Object
}, { timestamps: true });

module.exports = mongoose.model('Itinerary', itinerarySchema);