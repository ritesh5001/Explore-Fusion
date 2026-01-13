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
    
    
    
    const bookings = await Booking.find({ user_id }).populate('package_id');
    res.json(bookings);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

const getCreatorBookings = async (req, res) => {
  try {
    const { creatorId } = req.params;
    
    
    const myPackages = await Package.find({ creator_id: creatorId });
    const packageIds = myPackages.map(pkg => pkg._id);

    
    const sales = await Booking.find({ package_id: { $in: packageIds } })
      .populate('package_id', 'title price'); 

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
    const userId = req.headers['x-user-id']; 
    
    
    
    const itineraries = await Itinerary.find({ user_id: req.query.user_id }); 
    res.json(itineraries);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

exports.createBooking = async (req, res) => {
  try {
    const booking = await Booking.create(req.body);
    res.status(201).json(booking);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

exports.getUserBookings = async (req, res) => {
  try {
    const bookings = await Booking.find({ userId: req.params.userId }).populate('packageId');
    res.json(bookings);
  } catch (err) {
    res.status(500).json({ error: err.message });
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