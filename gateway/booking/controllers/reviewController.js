const mongoose = require('mongoose');

const jsonSuccess = (res, status, data) => res.status(status).json({ success: true, data });
const jsonError = (res, status, message) =>
  res.status(status).json({ success: false, message });

const isValidObjectId = (value) => mongoose.Types.ObjectId.isValid(value);

const makeReviewController = ({ Review, Booking, Package, Notification }) => {
  if (!Review || !Booking || !Package || !Notification) {
    throw new Error('Review controller requires Review, Booking, Package, and Notification models');
  }

  const createReview = async (req, res) => {
    try {
      const userId = req.user?._id;
      const { packageId, rating, comment } = req.body;

      if (!userId) {
        return jsonError(res, 401, 'Not authorized');
      }

      if (!packageId || !isValidObjectId(packageId)) {
        return jsonError(res, 400, 'Invalid packageId');
      }

      const numericRating = Number(rating);
      if (!Number.isFinite(numericRating) || numericRating < 1 || numericRating > 5) {
        return jsonError(res, 400, 'rating must be between 1 and 5');
      }

      const trimmedComment = String(comment || '').trim();
      if (!trimmedComment) {
        return jsonError(res, 400, 'comment is required');
      }

      const booking = await Booking.findOne({
        userId,
        packageId,
        status: { $ne: 'cancelled' },
      }).select('_id status');

      if (!booking) {
        return jsonError(res, 403, 'You can only review packages you booked');
      }

      const existing = await Review.findOne({ userId, packageId }).select('_id');
      if (existing) {
        return jsonError(res, 409, 'You already reviewed this package');
      }

      const review = await Review.create({
        userId,
        packageId,
        rating: numericRating,
        comment: trimmedComment,
      });

      const pkg = await Package.findById(packageId).select('creatorId title').lean();
      const creatorId = pkg?.creatorId;
      if (creatorId) {
        await Notification.create({
          userId: creatorId,
          type: 'review_added',
          title: 'New review received',
          message: `You received a new review${pkg?.title ? ` for ${pkg.title}` : ''}.`,
          link: `/packages/${packageId}`,
        }).catch(() => null);
      }

      return jsonSuccess(res, 201, review);
    } catch (error) {
      if (error?.code === 11000) {
        return jsonError(res, 409, 'You already reviewed this package');
      }
      return jsonError(res, 500, 'Server error');
    }
  };

  const getReviewsByPackage = async (req, res) => {
    try {
      const { packageId } = req.params;

      if (!packageId || !isValidObjectId(packageId)) {
        return jsonError(res, 400, 'Invalid packageId');
      }

      const reviews = await Review.find({ packageId }).sort({ createdAt: -1 });
      return jsonSuccess(res, 200, reviews);
    } catch (error) {
      return jsonError(res, 500, 'Server error');
    }
  };

  const deleteReview = async (req, res) => {
    try {
      const userId = req.user?._id;
      const role = req.user?.role;
      const { id } = req.params;

      if (!userId) {
        return jsonError(res, 401, 'Not authorized');
      }

      if (!id || !isValidObjectId(id)) {
        return jsonError(res, 400, 'Invalid id');
      }

      const review = await Review.findById(id);
      if (!review) {
        return jsonError(res, 404, 'Review not found');
      }

      const isOwner = String(review.userId) === String(userId);
      const isPrivileged = role === 'admin' || role === 'superadmin';

      if (!isOwner && !isPrivileged) {
        return jsonError(res, 403, 'Forbidden');
      }

      await review.deleteOne();
      return jsonSuccess(res, 200, { message: 'Review deleted' });
    } catch (error) {
      return jsonError(res, 500, 'Server error');
    }
  };

  return {
    createReview,
    getReviewsByPackage,
    deleteReview,
  };
};

module.exports = { makeReviewController };
