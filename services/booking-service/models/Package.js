const mongoose = require('mongoose');

const packageSchema = new mongoose.Schema({
  title: String,
  description: String,
  destination: String,
  price: Number,
  duration: String,
  images: [String],
  creatorId: String
}, { timestamps: true });

module.exports = mongoose.model('Package', packageSchema);