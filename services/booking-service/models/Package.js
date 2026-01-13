const mongoose = require('mongoose');

const PackageSchema = new mongoose.Schema({
  title: { type: String, required: true },
  description: String,
  destination: String,
  price: Number,
  duration: String, 
  images: [String],
  activities: [String],
}, { timestamps: true });

module.exports = mongoose.model('Package', PackageSchema);