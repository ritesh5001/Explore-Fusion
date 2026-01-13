const mongoose = require('mongoose');

const jsonSuccess = (res, status, data) => {
  return res.status(status).json({ success: true, data });
};

const jsonError = (res, status, message) => {
  return res.status(status).json({ success: false, message });
};

const toObjectId = (value) => {
  try {
    return new mongoose.Types.ObjectId(String(value));
  } catch {
    return null;
  }
};

const safeUserProjection = { password: 0, passwordResetTokenHash: 0, passwordResetTokenExpiresAt: 0 };

const makeAdminController = ({ User, Booking, Package, Itinerary }) => {
  const dashboard = async (req, res) => {
    try {
      const [
        totalUsers,
        totalCreators,
        blockedUsersCount,
        totalBookings,
        revenueAgg,
        activeTrips,
      ] = await Promise.all([
        User.countDocuments({}),
        User.countDocuments({ role: 'creator' }),
        User.countDocuments({ isBlocked: true }),
        Booking.countDocuments({}),
        Booking.aggregate([{ $group: { _id: null, total: { $sum: { $ifNull: ['$totalPrice', 0] } } } }]),
        Itinerary.countDocuments({}),
      ]);

      const totalRevenue = revenueAgg?.[0]?.total || 0;

      return jsonSuccess(res, 200, {
        totalUsers,
        totalCreators,
        totalBookings,
        totalRevenue,
        activeTrips,
        blockedUsersCount,
      });
    } catch (err) {
      return jsonError(res, 500, 'Server error');
    }
  };

  const listUsers = async (req, res) => {
    try {
      const users = await User.find({}).select(safeUserProjection).sort({ createdAt: -1 });
      return jsonSuccess(res, 200, users);
    } catch {
      return jsonError(res, 500, 'Server error');
    }
  };

  const blockUser = async (req, res) => {
    try {
      const id = toObjectId(req.params.id);
      if (!id) return jsonError(res, 400, 'Invalid user id');

      const user = await User.findByIdAndUpdate(id, { isBlocked: true }, { new: true }).select(safeUserProjection);
      if (!user) return jsonError(res, 404, 'User not found');
      return jsonSuccess(res, 200, user);
    } catch {
      return jsonError(res, 500, 'Server error');
    }
  };

  const unblockUser = async (req, res) => {
    try {
      const id = toObjectId(req.params.id);
      if (!id) return jsonError(res, 400, 'Invalid user id');

      const user = await User.findByIdAndUpdate(id, { isBlocked: false }, { new: true }).select(safeUserProjection);
      if (!user) return jsonError(res, 404, 'User not found');
      return jsonSuccess(res, 200, user);
    } catch {
      return jsonError(res, 500, 'Server error');
    }
  };

  const updateUserRole = async (req, res) => {
    try {
      const id = toObjectId(req.params.id);
      if (!id) return jsonError(res, 400, 'Invalid user id');

      const { role } = req.body;
      const allowed = ['user', 'creator', 'admin', 'superadmin'];
      if (!allowed.includes(role)) {
        return jsonError(res, 400, 'Invalid role');
      }

      // Important: prevent accidentally demoting the last superadmin.
      if (role !== 'superadmin') {
        const existing = await User.findById(id).select('role');
        if (existing?.role === 'superadmin') {
          const superadminCount = await User.countDocuments({ role: 'superadmin' });
          if (superadminCount <= 1) {
            return jsonError(res, 400, 'Cannot remove last superadmin');
          }
        }
      }

      const user = await User.findByIdAndUpdate(id, { role }, { new: true }).select(safeUserProjection);
      if (!user) return jsonError(res, 404, 'User not found');
      return jsonSuccess(res, 200, user);
    } catch {
      return jsonError(res, 500, 'Server error');
    }
  };

  const deleteUser = async (req, res) => {
    try {
      const id = toObjectId(req.params.id);
      if (!id) return jsonError(res, 400, 'Invalid user id');

      const user = await User.findById(id).select('role');
      if (!user) return jsonError(res, 404, 'User not found');

      if (user.role === 'superadmin') {
        const superadminCount = await User.countDocuments({ role: 'superadmin' });
        if (superadminCount <= 1) {
          return jsonError(res, 400, 'Cannot delete last superadmin');
        }
      }

      await User.deleteOne({ _id: id });
      return jsonSuccess(res, 200, { message: 'User deleted' });
    } catch {
      return jsonError(res, 500, 'Server error');
    }
  };

  const listCreators = async (req, res) => {
    try {
      const creators = await User.find({ role: 'creator' }).select(safeUserProjection).sort({ createdAt: -1 });
      return jsonSuccess(res, 200, creators);
    } catch {
      return jsonError(res, 500, 'Server error');
    }
  };

  const verifyCreator = async (req, res) => {
    try {
      const id = toObjectId(req.params.id);
      if (!id) return jsonError(res, 400, 'Invalid user id');

      const user = await User.findByIdAndUpdate(
        id,
        { isVerifiedCreator: true },
        { new: true }
      ).select(safeUserProjection);

      if (!user) return jsonError(res, 404, 'User not found');
      return jsonSuccess(res, 200, user);
    } catch {
      return jsonError(res, 500, 'Server error');
    }
  };

  const listBookings = async (req, res) => {
    try {
      const bookings = await Booking.find({}).sort({ createdAt: -1 }).lean();

      // We can't rely on Mongoose populate across microservice DBs, so we join manually.
      const userIds = new Set();
      const creatorIds = new Set();
      const packageIds = new Set();

      for (const b of bookings) {
        if (b.userId) userIds.add(String(b.userId));
        if (b.creatorId) creatorIds.add(String(b.creatorId));
        if (b.packageId) packageIds.add(String(b.packageId));
      }

      const [users, creators, packages] = await Promise.all([
        userIds.size ? User.find({ _id: { $in: [...userIds].map(toObjectId).filter(Boolean) } }).select(safeUserProjection).lean() : [],
        creatorIds.size ? User.find({ _id: { $in: [...creatorIds].map(toObjectId).filter(Boolean) } }).select(safeUserProjection).lean() : [],
        packageIds.size ? Package.find({ _id: { $in: [...packageIds].map(toObjectId).filter(Boolean) } }).lean() : [],
      ]);

      const userById = new Map(users.map((u) => [String(u._id), u]));
      const creatorById = new Map(creators.map((u) => [String(u._id), u]));
      const packageById = new Map(packages.map((p) => [String(p._id), p]));

      const hydrated = bookings.map((b) => ({
        ...b,
        user: userById.get(String(b.userId)) || null,
        creator: b.creatorId ? creatorById.get(String(b.creatorId)) || null : null,
        package: packageById.get(String(b.packageId)) || null,
      }));

      return jsonSuccess(res, 200, hydrated);
    } catch (err) {
      return jsonError(res, 500, 'Server error');
    }
  };

  const cancelBooking = async (req, res) => {
    try {
      const id = toObjectId(req.params.id);
      if (!id) return jsonError(res, 400, 'Invalid booking id');

      const booking = await Booking.findByIdAndUpdate(
        id,
        { status: 'cancelled' },
        { new: true }
      );

      if (!booking) return jsonError(res, 404, 'Booking not found');
      return jsonSuccess(res, 200, booking);
    } catch {
      return jsonError(res, 500, 'Server error');
    }
  };

  const systemReport = async (req, res) => {
    try {
      const now = new Date();
      const monthStart = new Date(now.getFullYear(), now.getMonth(), 1);

      const [newUsersThisMonth, revenueAgg, topCreatorsAgg, mostBookedPackagesAgg] = await Promise.all([
        User.countDocuments({ createdAt: { $gte: monthStart } }),
        Booking.aggregate([
          { $match: { createdAt: { $gte: monthStart } } },
          { $group: { _id: null, total: { $sum: { $ifNull: ['$totalPrice', 0] } } } },
        ]),
        Booking.aggregate([
          { $match: { creatorId: { $exists: true, $ne: null } } },
          { $group: { _id: '$creatorId', totalBookings: { $sum: 1 }, totalRevenue: { $sum: { $ifNull: ['$totalPrice', 0] } } } },
          { $sort: { totalRevenue: -1 } },
          { $limit: 5 },
        ]),
        Booking.aggregate([
          { $group: { _id: '$packageId', bookings: { $sum: 1 } } },
          { $sort: { bookings: -1 } },
          { $limit: 20 },
        ]),
      ]);

      const revenueThisMonth = revenueAgg?.[0]?.total || 0;

      const topCreatorIds = topCreatorsAgg.map((c) => c._id).filter(Boolean);
      const topCreatorUsers = topCreatorIds.length
        ? await User.find({ _id: { $in: topCreatorIds } }).select(safeUserProjection).lean()
        : [];
      const topCreatorById = new Map(topCreatorUsers.map((u) => [String(u._id), u]));

      const topCreators = topCreatorsAgg.map((c) => ({
        creator: topCreatorById.get(String(c._id)) || { _id: c._id },
        totalBookings: c.totalBookings,
        totalRevenue: c.totalRevenue,
      }));

      const mostBookedPackageIds = mostBookedPackagesAgg.map((p) => p._id).filter(Boolean);
      const mostBookedPackages = mostBookedPackageIds.length
        ? await Package.find({ _id: { $in: mostBookedPackageIds } }).select('destination title').lean()
        : [];
      const packageById = new Map(mostBookedPackages.map((p) => [String(p._id), p]));

      const destinationCounts = new Map();
      for (const row of mostBookedPackagesAgg) {
        const pkg = packageById.get(String(row._id));
        const dest = pkg?.destination || 'Unknown';
        destinationCounts.set(dest, (destinationCounts.get(dest) || 0) + row.bookings);
      }

      const mostBookedDestinations = [...destinationCounts.entries()]
        .map(([destination, bookings]) => ({ destination, bookings }))
        .sort((a, b) => b.bookings - a.bookings)
        .slice(0, 10);

      return jsonSuccess(res, 200, {
        newUsersThisMonth,
        revenueThisMonth,
        topCreators,
        mostBookedDestinations,
      });
    } catch (err) {
      return jsonError(res, 500, 'Server error');
    }
  };

  return {
    dashboard,
    listUsers,
    blockUser,
    unblockUser,
    updateUserRole,
    deleteUser,
    listCreators,
    verifyCreator,
    listBookings,
    cancelBooking,
    systemReport,
  };
};

module.exports = { makeAdminController };
