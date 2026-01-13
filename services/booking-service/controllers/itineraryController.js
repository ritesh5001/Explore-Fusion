const Itinerary = require('../models/Itinerary');

// POST /api/v1/itineraries
exports.saveItinerary = async (req, res) => {
  try {
    const itin = await Itinerary.create(req.body);
    res.status(201).json(itin);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// GET /api/v1/itineraries/my?userId=123
exports.getUserItineraries = async (req, res) => {
  try {
    const { userId } = req.query;
    const itins = await Itinerary.find({ userId });
    res.json(itins);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};