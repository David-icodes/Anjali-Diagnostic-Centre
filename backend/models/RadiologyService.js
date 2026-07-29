const mongoose = require('mongoose');

const radiologyServiceSchema = mongoose.Schema({
  name: { type: String, required: true, trim: true },
  price: { type: Number, required: true },
  category: { type: String, default: 'Other' },
  isActive: { type: Boolean, default: true },
  isPopular: { type: Boolean, default: false },
  hasOffer: { type: Boolean, default: false },
  offerText: { type: String, default: '' },
  isDeleted: { type: Boolean, default: false, index: true },
  deletedAt: { type: Date, default: null },
  deletedBy: {
    userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', default: null },
    username: { type: String, default: '' },
  },
}, { timestamps: true });

module.exports = mongoose.model('RadiologyService', radiologyServiceSchema);
