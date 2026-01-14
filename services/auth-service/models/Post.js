const mongoose = require('mongoose');

// Lightweight model used for profile aggregation (postsCount).
// Must match the collection/model name used by post-service.
const postSchema = new mongoose.Schema(
  {
    author: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      index: true,
      required: true,
    },
  },
  { timestamps: true }
);

module.exports = mongoose.models.Post || mongoose.model('Post', postSchema);
