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
    const { user_id } = req.body;
    // We populate 'package_id' to get the Title/Price details of the trip
    // Note: In true microservices, we can't 'populate' across databases.
    // BUT since Package and Booking are in the SAME service, we CAN do this!
    const bookings = await Booking.find({ user_id }).populate('package_id');
    res.json(bookings);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

const getCreatorBookings = async (req, res) => {
  try {
    const { creatorId } = req.params;
    
    // 1. Find all packages created by this person
    const myPackages = await Package.find({ creator_id: creatorId });
    const packageIds = myPackages.map(pkg => pkg._id);

    // 2. Find all bookings for these packages
    const sales = await Booking.find({ package_id: { $in: packageIds } })
      .populate('package_id', 'title price'); // Get title/price for display

    res.json(sales);
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
  getMyItineraries,
  getCreatorBookings
};