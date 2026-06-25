const mongoose = require('mongoose');

const healthPackageSchema = mongoose.Schema({
  name: { type: String, required: true, trim: true },
  description: { type: String, required: true, trim: true },
  benefits: [{ type: String }],
  includedTests: [{ type: String }],
  originalPrice: { type: Number, required: true },
  offerPrice: { type: Number, default: 0 },
  discountPercentage: { type: Number, default: 0 },
  hasOffer: { type: Boolean, default: false },
  offerText: { type: String, default: '', trim: true },
  isPopular: { type: Boolean, default: false },
  homeCollectionAvailable: { type: Boolean, default: true },
  labVisitAvailable: { type: Boolean, default: true },
  image: { type: String, default: '', trim: true },
  isActive: { type: Boolean, default: true },
  isDeleted: { type: Boolean, default: false, index: true },
  deletedAt: { type: Date, default: null },
  deletedBy: {
    userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', default: null },
    username: { type: String, default: '' },
  },
}, { timestamps: true });

module.exports = mongoose.model('HealthPackage', healthPackageSchema);
