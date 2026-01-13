const Itinerary = require('../models/Itinerary');

exports.saveItinerary = async (req, res) => {
  try {
    const itin = await Itinerary.create(req.body);
    res.status(201).json(itin);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

exports.getUserItineraries = async (req, res) => {
  try {
    const itins = await Itinerary.find({ userId: req.params.userId });
    res.json(itins);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};