const mongoose = require('mongoose');

const healthPackageSchema = mongoose.Schema({
  name: { type: String, required: true, trim: true },
  description: { type: String, required: true },
  benefits: [{ type: String }],
  includedTests: [{ type: String }],
  originalPrice: { type: Number, required: true },
  offerPrice: { type: Number, required: true },
  discountPercentage: { type: Number, default: 0 },
  homeCollectionAvailable: { type: Boolean, default: true },
  isActive: { type: Boolean, default: true },
}, { timestamps: true });

module.exports = mongoose.model('HealthPackage', healthPackageSchema);
