const mongoose = require('mongoose');

const matchSchema = new mongoose.Schema(
  {
    requesterId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    receiverId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    status: {
      type: String,
      enum: ['pending', 'accepted', 'rejected'],
      default: 'pending',
      required: true,
    },
    matchedAt: {
      type: Date,
    },
  },
  { timestamps: true }
);

matchSchema.index({ requesterId: 1, receiverId: 1 }, { unique: true });
matchSchema.index({ receiverId: 1, status: 1 });

module.exports = mongoose.model('Match', matchSchema);
