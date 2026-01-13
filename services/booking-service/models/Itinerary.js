const mongoose = require('mongoose');

const ItinerarySchema = new mongoose.Schema({
  user_id: { type: String, required: true },
  destination: { type: String, required: true },
  duration: { type: Number, required: true },
  budget: { type: Number, required: true },
  total_cost: String, // From AI response
  currency: String,   // From AI response
  activities: [       // The array of days from AI
    {
      day: Number,
      activity: String,
      cost: Number
    }
  ],
  note: String,
  createdAt: { type: Date, default: Date.now }
});

module.exports = mongoose.model('Itinerary', ItinerarySchema);