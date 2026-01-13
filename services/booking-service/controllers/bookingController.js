const Package = require('../models/Package');
const Booking = require('../models/booking');

// POST /api/v1/bookings
exports.createBooking = async (req, res) => {
  try {
    const booking = await Booking.create(req.body);
    res.status(201).json(booking);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// GET /api/v1/bookings/my?userId=123
exports.getMyBookings = async (req, res) => {
  try {
    const { userId } = req.query;
    const bookings = await Booking.find({ userId }).populate('packageId');
    res.json(bookings);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// GET /api/v1/bookings/creator/:creatorId
exports.getCreatorBookings = async (req, res) => {
  try {
    const { creatorId } = req.params;

    const packages = await Package.find({ creatorId });
    const packageIds = packages.map(p => p._id);

    const sales = await Booking.find({
      packageId: { $in: packageIds }
    }).populate('packageId', 'title price');

    res.json(sales);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};