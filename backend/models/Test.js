const mongoose = require('mongoose');

const testSchema = mongoose.Schema(
  {
    name: {
      type: String,
      required: true,
      trim: true,
    },
    category: {
      type: String,
      default: 'Other',
      enum: [
        'Blood Test',
        'Urine Test',
        'Cardiac',
        'Diabetes',
        'Thyroid',
        'Liver',
        'Kidney',
        'Hormones',
        'Vitamin',
        'Infection',
        'Cancer',
        'Full Body Checkup',
        'Women Health',
        'Senior Citizen',
        'Other',
      ],
    },
    description: {
      type: String,
      default: '',
    },
    image: {
      type: String,
      default: '',
    },
    originalPrice: {
      type: Number,
      required: true,
    },
    offerPrice: {
      type: Number,
      default: 0,
    },
    hasOffer: {
      type: Boolean,
      default: false,
      index: true,
    },
    offerLabel: {
      type: String,
      default: '',
      trim: true,
    },
    offerBadge: {
      type: String,
      default: '',
      trim: true,
    },
    preparationInstructions: {
      type: String,
      default: '',
    },
    testDuration: {
      type: String,
      default: '24 Hours',
    },
    isActive: {
      type: Boolean,
      default: true,
    },
    isPopular: {
      type: Boolean,
      default: false,
    },
    isDeleted: {
      type: Boolean,
      default: false,
      index: true,
    },
    deletedAt: {
      type: Date,
      default: null,
    },
    deletedBy: {
      userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', default: null },
      username: { type: String, default: '' },
    },
  },
  { timestamps: true }
);

module.exports = mongoose.model('Test', testSchema);
