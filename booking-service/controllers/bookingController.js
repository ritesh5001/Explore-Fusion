const Package = require('../models/Package');
const Booking = require('../models/booking');
const Itinerary = require('../models/Itinerary');

const getAllPackages = async (req, res) => {
  try {
    const packages = await Package.find();
    res.json(packages);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

const createPackage = async (req, res) => {
  try {
    const newPackage = await Package.create(req.body);
    res.status(201).json(newPackage);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
};

const createBooking = async (req, res) => {
  try {
    const booking = await Booking.create(req.body);
    res.status(201).json(booking);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
};

const getMyBookings = async (req, res) => {
  try {
    const bookings = await Booking.find({ user_id: req.body.user_id });
    res.json(bookings);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

const createItinerary = async (req, res) => {
  try {
    const itinerary = await Itinerary.create(req.body);
    res.status(201).json(itinerary);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
};

const getMyItineraries = async (req, res) => {
  try {
    const userId = req.headers['x-user-id']; // Gateway passes this, or we send in body
    // For simplicity, let's assume Frontend sends user_id in the body for now, 
    // OR we filter by what we receive.
    // Let's rely on the body.user_id for this step to keep it simple.
    const itineraries = await Itinerary.find({ user_id: req.query.user_id }); 
    res.json(itineraries);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

module.exports = {
  getAllPackages,
  createPackage,
  createBooking,
  getMyBookings,
  createItinerary,  
  getMyItineraries   
};