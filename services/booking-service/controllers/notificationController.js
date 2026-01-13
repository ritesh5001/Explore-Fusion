const mongoose = require('mongoose');

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

const isValidObjectId = (value) => mongoose.Types.ObjectId.isValid(value);

const isAdminOrSuperAdmin = (user) => {
  const role = user?.role;
  return role === 'admin' || role === 'superadmin';
};

// POST /
// Internal-ish endpoint:
// - admin_action requires admin/superadmin
// - non-admin can only create notifications for themselves (prevents spamming others)
const createNotification = async (req, res) => {
  try {
    const actor = req.user;
    if (!actor?._id) return jsonError(res, 401, 'Not authorized');

    const { userId, type, title, message, link } = req.body || {};

    if (!userId || !isValidObjectId(userId)) {
      return jsonError(res, 400, 'Invalid userId');
    }

    if (!type || typeof type !== 'string') {
      return jsonError(res, 400, 'type is required');
    }

    const trimmedTitle = String(title || '').trim();
    const trimmedMessage = String(message || '').trim();
    if (!trimmedTitle) return jsonError(res, 400, 'title is required');
    if (!trimmedMessage) return jsonError(res, 400, 'message is required');

    if (type === 'admin_action' && !isAdminOrSuperAdmin(actor)) {
      return jsonError(res, 403, 'Forbidden');
    }

    if (!isAdminOrSuperAdmin(actor) && String(userId) !== String(actor._id)) {
      return jsonError(res, 403, 'Forbidden');
    }

    const notification = await Notification.create({
      userId,
      type,
      title: trimmedTitle,
      message: trimmedMessage,
      link: link ? String(link).trim() : undefined,
      isRead: false,
    });

    return jsonSuccess(res, 201, notification);
  } catch (error) {
    return jsonError(res, 500, 'Server error');
  }
};

// GET /my
const getMyNotifications = async (req, res) => {
  try {
    const userId = req.user?._id;
    if (!userId) return jsonError(res, 401, 'Not authorized');

    const unreadOnly = String(req.query?.unreadOnly || '').toLowerCase() === 'true';
    const limitRaw = Number(req.query?.limit);
    const limit = Number.isFinite(limitRaw) ? Math.min(Math.max(limitRaw, 1), 200) : 50;

    const filter = { userId };
    if (unreadOnly) filter.isRead = false;

    const notifications = await Notification.find(filter)
      .sort({ createdAt: -1 })
      .limit(limit);

    return jsonSuccess(res, 200, notifications);
  } catch (error) {
    return jsonError(res, 500, 'Server error');
  }
};

// PUT /:id/read
const markAsRead = async (req, res) => {
  try {
    const userId = req.user?._id;
    const { id } = req.params;

    if (!userId) return jsonError(res, 401, 'Not authorized');
    if (!id || !isValidObjectId(id)) return jsonError(res, 400, 'Invalid id');

    const notification = await Notification.findById(id);
    if (!notification) return jsonError(res, 404, 'Notification not found');

    if (String(notification.userId) !== String(userId)) {
      return jsonError(res, 403, 'Forbidden');
    }

    if (!notification.isRead) {
      notification.isRead = true;
      await notification.save();
    }

    return jsonSuccess(res, 200, notification);
  } catch (error) {
    return jsonError(res, 500, 'Server error');
  }
};

// DELETE /:id
const deleteNotification = async (req, res) => {
  try {
    const userId = req.user?._id;
    const { id } = req.params;

    if (!userId) return jsonError(res, 401, 'Not authorized');
    if (!id || !isValidObjectId(id)) return jsonError(res, 400, 'Invalid id');

    const notification = await Notification.findById(id);
    if (!notification) return jsonError(res, 404, 'Notification not found');

    if (String(notification.userId) !== String(userId)) {
      return jsonError(res, 403, 'Forbidden');
    }

    await notification.deleteOne();
    return jsonSuccess(res, 200, { message: 'Notification deleted' });
  } catch (error) {
    return jsonError(res, 500, 'Server error');
  }
};

// DELETE /clear/all
const clearAllNotifications = async (req, res) => {
  try {
    const userId = req.user?._id;
    if (!userId) return jsonError(res, 401, 'Not authorized');

    await Notification.deleteMany({ userId });
    return jsonSuccess(res, 200, { message: 'Notifications cleared' });
  } catch (error) {
    return jsonError(res, 500, 'Server error');
  }
};

module.exports = {
  createNotification,
  getMyNotifications,
  markAsRead,
  deleteNotification,
  clearAllNotifications,
};
