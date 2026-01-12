const mongoose = require('mongoose');

const PackageSchema = new mongoose.Schema({
  title: { type: String, required: true },
  price: { type: Number, required: true },
  description: String,
  location: String,
  duration: String,
  creator_id: { type: String, required: true } // Admin or Influencer ID
});

module.exports = mongoose.model('Package', PackageSchema);