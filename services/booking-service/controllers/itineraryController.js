const Itinerary = require('../models/Itinerary');


exports.saveItinerary = async (req, res) => {
  try {
    const itin = await Itinerary.create(req.body);
    res.status(201).json(itin);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};


exports.getUserItineraries = async (req, res) => {
  try {
    const { userId } = req.query;
    const itins = await Itinerary.find({ userId });
    res.json(itins);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};