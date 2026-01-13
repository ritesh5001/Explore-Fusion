const mongoose = require('mongoose');

const packageSchema = new mongoose.Schema({
  title: { type: String, required: true, trim: true },
  description: { type: String, required: true, trim: true },
  destination: { type: String, required: true, trim: true, index: true },
  price: { type: Number, required: true, min: 0 },
  duration: { type: String, required: true, trim: true },
  images: [{ type: String }],
  creatorId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true, index: true },
}, { timestamps: true });

module.exports = mongoose.model('Package', packageSchema);