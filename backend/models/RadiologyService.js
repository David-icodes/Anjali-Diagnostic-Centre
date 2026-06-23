const mongoose = require('mongoose');

const radiologyServiceSchema = mongoose.Schema({
  name: { type: String, required: true, trim: true },
  description: { type: String, required: true },
  price: { type: Number, required: true },
  category: { type: String, default: 'General' },
  preparationInstructions: { type: String, default: '' },
  duration: { type: String, default: '' },
  isActive: { type: Boolean, default: true },
}, { timestamps: true });

module.exports = mongoose.model('RadiologyService', radiologyServiceSchema);
