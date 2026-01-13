const mongoose = require('mongoose');

const userSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,  
  },
  email: {
    type: String,
    required: true,
    unique: true,
    lowercase: true,
    trim: true,
  },
  password: {
    type: String,
    required: true,
    select: false,
  },
  role: { 
  type: String, 
  enum: ['user', 'creator', 'admin', 'superadmin'], 
  default: 'user' 
},
isBlocked: { 
  type: Boolean, 
  default: false 
},
isVerifiedCreator: {
  type: Boolean,
  default: false,
},
passwordResetTokenHash: {
  type: String,
  select: false,
},
passwordResetTokenExpiresAt: {
  type: Date,
  select: false,
}
}, {
  timestamps: true 
});

module.exports = mongoose.model('User', userSchema);