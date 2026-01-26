const mongoose = require('mongoose');

const jsonSuccess = (res, status, data) => res.status(status).json({ success: true, data });
const jsonError = (res, status, message) =>
  res.status(status).json({ success: false, message });

const isValidId = (value) => mongoose.isValidObjectId(value);

const makeItineraryController = ({ Itinerary }) => {
  if (!Itinerary) {
    throw new Error('Itinerary controller requires the Itinerary model');
  }

  const isAdminOrSuperAdmin = (user) => {
    const role = user?.role;
    return role === 'admin' || role === 'superadmin';
  };

  const validateActivities = (activities) => {
    if (!Array.isArray(activities)) return 'activities must be an array';
    for (const item of activities) {
      const day = Number(item?.day);
      const cost = Number(item?.cost);
      const activity = typeof item?.activity === 'string' ? item.activity.trim() : '';
      if (!Number.isFinite(day) || day < 1) return 'Invalid activity day';
      if (!activity) return 'Invalid activity text';
      if (!Number.isFinite(cost) || cost < 0) return 'Invalid activity cost';
    }
    return null;
  };

  const createItinerary = async (req, res) => {
    try {
      const { destination, duration, budget, total_cost, currency, activities, note } = req.body;

      const dest = typeof destination === 'string' ? destination.trim() : '';
      if (!dest) return jsonError(res, 400, 'destination is required');

      const durationNum = Number(duration);
      if (!Number.isFinite(durationNum) || durationNum < 1) {
        return jsonError(res, 400, 'Invalid duration');
      }

      const budgetNum = Number(budget);
      if (!Number.isFinite(budgetNum) || budgetNum < 0) {
        return jsonError(res, 400, 'Invalid budget');
      }

      const curr = typeof currency === 'string' ? currency.trim() : '';
      if (!curr) return jsonError(res, 400, 'currency is required');

      const activitiesError = validateActivities(activities);
      if (activitiesError) return jsonError(res, 400, activitiesError);

      let totalCostNum;
      if (total_cost !== undefined && total_cost !== null && total_cost !== '') {
        totalCostNum = Number(total_cost);
        if (!Number.isFinite(totalCostNum) || totalCostNum < 0) {
          return jsonError(res, 400, 'Invalid total_cost');
        }
      }

      const itin = await Itinerary.create({
        userId: req.user._id,
        destination: dest,
        duration: Math.floor(durationNum),
        budget: budgetNum,
        total_cost: totalCostNum,
        currency: curr,
        activities: activities.map((a) => ({
          day: Math.floor(Number(a.day)),
          activity: String(a.activity).trim(),
          cost: Number(a.cost),
        })),
        note: typeof note === 'string' ? note.trim() : undefined,
      });

      return jsonSuccess(res, 201, itin);
    } catch (error) {
      return jsonError(res, 500, 'Server error');
    }
  };

  const getMyItineraries = async (req, res) => {
    try {
      const items = await Itinerary.find({ userId: req.user._id }).sort({ createdAt: -1 });
      return jsonSuccess(res, 200, { itineraries: items });
    } catch (error) {
      return jsonError(res, 500, 'Server error');
    }
  };

  const getItineraryById = async (req, res) => {
    try {
      const { id } = req.params;
      if (!isValidId(id)) return jsonError(res, 400, 'Invalid itinerary id');

      const itin = await Itinerary.findById(id);
      if (!itin) return jsonError(res, 404, 'Itinerary not found');

      const isOwner = String(itin.userId) === String(req.user._id);
      if (!isOwner && !isAdminOrSuperAdmin(req.user)) {
        return jsonError(res, 403, 'Forbidden');
      }

      return jsonSuccess(res, 200, itin);
    } catch (error) {
      return jsonError(res, 500, 'Server error');
    }
  };

  const deleteItinerary = async (req, res) => {
    try {
      const { id } = req.params;
      if (!isValidId(id)) return jsonError(res, 400, 'Invalid itinerary id');

      const itin = await Itinerary.findById(id);
      if (!itin) return jsonError(res, 404, 'Itinerary not found');

      const isOwner = String(itin.userId) === String(req.user._id);
      if (!isOwner && !isAdminOrSuperAdmin(req.user)) {
        return jsonError(res, 403, 'Forbidden');
      }

      await Itinerary.deleteOne({ _id: itin._id });
      return jsonSuccess(res, 200, { message: 'Itinerary deleted' });
    } catch (error) {
      return jsonError(res, 500, 'Server error');
    }
  };

  const getAllItineraries = async (req, res) => {
    try {
      if (!isAdminOrSuperAdmin(req.user)) {
        return jsonError(res, 403, 'Forbidden');
      }

      const items = await Itinerary.find({}).sort({ createdAt: -1 });
      return jsonSuccess(res, 200, { itineraries: items });
    } catch (error) {
      return jsonError(res, 500, 'Server error');
    }
  };

  return {
    createItinerary,
    getMyItineraries,
    getItineraryById,
    deleteItinerary,
    getAllItineraries,
  };
};

module.exports = { makeItineraryController };
