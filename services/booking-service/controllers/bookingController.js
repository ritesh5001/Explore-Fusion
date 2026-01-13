const Package = require('../models/Package');
const Booking = require('../models/booking');


exports.createBooking = async (req, res) => {
  try {
    const { userId, packageId, status } = req.body;

    if (!userId || !packageId) {
      return res.status(400).json({ message: 'userId and packageId are required' });
    }

    const booking = await Booking.create({
      userId,
      packageId,
      status: status || 'confirmed',
    });

    res.status(201).json(booking);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};


exports.getMyBookings = async (req, res) => {
  try {
    const { userId } = req.query;

    if (!userId) {
      return res.status(400).json({ message: 'userId query param required' });
    }

    const bookings = await Booking
      .find({ userId })
      .populate('packageId');

    res.json(bookings);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};


exports.getCreatorBookings = async (req, res) => {
  try {
    const { creatorId } = req.params;

    
    const packages = await Package.find({ creator_id: creatorId });
    const packageIds = packages.map(p => p._id);

    
    const sales = await Booking.find({
      packageId: { $in: packageIds }
    }).populate('packageId', 'title price');

    res.json(sales);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};