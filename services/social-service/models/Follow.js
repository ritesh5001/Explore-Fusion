const mongoose = require('mongoose');

const roles = ['user', 'creator', 'admin', 'superadmin'];

const followSchema = new mongoose.Schema(
  {
    followerId: {
      type: mongoose.Schema.Types.ObjectId,
      required: true,
      index: true,
    },
    followerRole: {
      type: String,
      enum: roles,
      required: true,
    },
    followingId: {
      type: mongoose.Schema.Types.ObjectId,
      required: true,
      index: true,
    },
    followingRole: {
      type: String,
      enum: roles,
      required: true,
    },
    createdAt: {
      type: Date,
      default: Date.now,
      index: true,
    },
  },
  {
    versionKey: false,
  }
);

// Prevent duplicate follows
followSchema.index({ followerId: 1, followingId: 1 }, { unique: true });

module.exports = mongoose.model('Follow', followSchema);
