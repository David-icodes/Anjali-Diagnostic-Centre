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
      required: true,
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
      required: true,
    },
    originalPrice: {
      type: Number,
      required: true,
    },
    offerPrice: {
      type: Number,
      required: true,
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
  },
  { timestamps: true }
);

module.exports = mongoose.model('Test', testSchema);
