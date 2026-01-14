const mongoose = require('mongoose');

// Minimal User model so Post.populate('author') works.
// Must be compatible with auth-service User collection.
const userSchema = new mongoose.Schema(
  {
    name: { type: String },
    username: { type: String },
    role: { type: String, enum: ['user', 'creator', 'admin', 'superadmin'] },
    avatar: { type: String },
  },
  { timestamps: true }
);

module.exports = mongoose.models.User || mongoose.model('User', userSchema);
