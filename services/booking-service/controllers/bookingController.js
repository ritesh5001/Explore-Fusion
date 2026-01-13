const mongoose = require('mongoose');
const Package = require('../models/Package');
const Booking = require('../models/booking');
const Notification = require('../models/Notification');

const jsonSuccess = (res, status, data) => {
  return res.status(status).json({
    success: true,
    data,
  });
};

const jsonError = (res, status, message) => {
  return res.status(status).json({
    success: false,
    message,
  });
};

const isValidId = (id) => mongoose.isValidObjectId(id);

const isAdminOrSuperAdmin = (user) => {
  const role = user?.role;
  return role === 'admin' || role === 'superadmin';
};

const isSuperAdmin = (user) => user?.role === 'superadmin';

const createBooking = async (req, res) => {
  try {
    const { packageId, guests } = req.body;

    if (!packageId) {
      return jsonError(res, 400, 'packageId is required');
    }
    if (!isValidId(packageId)) {
      return jsonError(res, 400, 'Invalid package id');
    }

    const guestsNumRaw = guests === undefined ? 1 : Number(guests);
    if (!Number.isFinite(guestsNumRaw) || guestsNumRaw < 1) {
      return jsonError(res, 400, 'Invalid guests');
    }
    const guestsNum = Math.floor(guestsNumRaw);

    const pkg = await Package.findById(packageId);
    if (!pkg) {
      return jsonError(res, 404, 'Package not found');
    }

    const creatorId = pkg.creatorId;
    if (!creatorId) {
      return jsonError(res, 500, 'Package creator not set');
    }

    const price = Number(pkg.price);
    if (!Number.isFinite(price) || price < 0) {
      return jsonError(res, 500, 'Invalid package price');
    }

    const totalPrice = price * guestsNum;

    const booking = await Booking.create({
      userId: req.user._id,
      packageId: pkg._id,
      creatorId,
      status: 'confirmed',
      guests: guestsNum,
      totalPrice,
      cancelledAt: null,
    });

    // Notify booking user
    await Notification.create({
      userId: req.user._id,
      type: 'booking_confirmed',
      title: 'Booking confirmed',
      message: 'Your booking has been confirmed.',
      link: '/my-trips',
    }).catch(() => null);

    const populated = await Booking.findById(booking._id).populate('packageId');
    return jsonSuccess(res, 201, populated);
  } catch (err) {
    return jsonError(res, 500, 'Server error');
  }
};

const getMyBookings = async (req, res) => {
  try {
    const bookings = await Booking.find({ userId: req.user._id })
      .sort({ createdAt: -1 })
      .populate('packageId');

    return jsonSuccess(res, 200, { bookings });
  } catch (err) {
    return jsonError(res, 500, 'Server error');
  }
};

const getBookingById = async (req, res) => {
  try {
    const { id } = req.params;
    if (!isValidId(id)) {
      return jsonError(res, 400, 'Invalid booking id');
    }

    const booking = await Booking.findById(id).populate('packageId');
    if (!booking) {
      return jsonError(res, 404, 'Booking not found');
    }

    const isOwner = String(booking.userId) === String(req.user._id);
    const isCreator = String(booking.creatorId) === String(req.user._id);
    const isAdmin = isAdminOrSuperAdmin(req.user);

    if (!isOwner && !isCreator && !isAdmin) {
      return jsonError(res, 403, 'Forbidden');
    }

    return jsonSuccess(res, 200, booking);
  } catch (err) {
    return jsonError(res, 500, 'Server error');
  }
};

const cancelBooking = async (req, res) => {
  try {
    const { id } = req.params;
    if (!isValidId(id)) {
      return jsonError(res, 400, 'Invalid booking id');
    }

    const booking = await Booking.findById(id);
    if (!booking) {
      return jsonError(res, 404, 'Booking not found');
    }

    const isOwner = String(booking.userId) === String(req.user._id);
    const isAdmin = isAdminOrSuperAdmin(req.user);

    if (!isOwner && !isAdmin) {
      return jsonError(res, 403, 'Forbidden');
    }

    if (booking.status === 'cancelled') {
      return jsonSuccess(res, 200, booking);
    }

    booking.status = 'cancelled';
    booking.cancelledAt = new Date();
    await booking.save();

    return jsonSuccess(res, 200, booking);
  } catch (err) {
    return jsonError(res, 500, 'Server error');
  }
};

const getAllBookings = async (req, res) => {
  try {
    const role = req.user?.role;

    let filter = {};
    if (isAdminOrSuperAdmin(req.user)) {
      filter = {};
    } else if (role === 'creator') {
      // Creator sales visibility: bookings for their packages
      filter = { creatorId: req.user._id };
    } else {
      return jsonError(res, 403, 'Forbidden');
    }

    const bookings = await Booking.find(filter)
      .sort({ createdAt: -1 })
      .populate('packageId');

    return jsonSuccess(res, 200, { bookings });
  } catch (err) {
    return jsonError(res, 500, 'Server error');
  }
};

const updateBookingStatus = async (req, res) => {
  try {
    if (!isAdminOrSuperAdmin(req.user)) {
      return jsonError(res, 403, 'Forbidden');
    }

    const { id } = req.params;
    if (!isValidId(id)) {
      return jsonError(res, 400, 'Invalid booking id');
    }

    const { status } = req.body;
    const allowed = ['pending', 'confirmed', 'cancelled'];
    if (!status || !allowed.includes(String(status))) {
      return jsonError(res, 400, 'Invalid status');
    }

    const booking = await Booking.findById(id);
    if (!booking) {
      return jsonError(res, 404, 'Booking not found');
    }

    booking.status = String(status);
    if (booking.status === 'cancelled') {
      booking.cancelledAt = booking.cancelledAt || new Date();
    } else {
      booking.cancelledAt = null;
    }

    await booking.save();

    const populated = await Booking.findById(booking._id).populate('packageId');
    return jsonSuccess(res, 200, populated);
  } catch (err) {
    return jsonError(res, 500, 'Server error');
  }
};

const deleteBooking = async (req, res) => {
  try {
    if (!isSuperAdmin(req.user)) {
      return jsonError(res, 403, 'Forbidden');
    }

    const { id } = req.params;
    if (!isValidId(id)) {
      return jsonError(res, 400, 'Invalid booking id');
    }

    const booking = await Booking.findById(id);
    if (!booking) {
      return jsonError(res, 404, 'Booking not found');
    }

    await Booking.deleteOne({ _id: booking._id });
    return jsonSuccess(res, 200, { message: 'Booking deleted' });
  } catch (err) {
    return jsonError(res, 500, 'Server error');
  }
};

module.exports = {
  createBooking,
  getMyBookings,
  getBookingById,
  cancelBooking,
  getAllBookings,
  updateBookingStatus,
  deleteBooking,
};