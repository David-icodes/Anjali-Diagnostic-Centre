const mongoose = require('mongoose');

const bookingSchema = mongoose.Schema(
  {
    bookingId: {
      type: String,
      required: true,
      unique: true,
      index: true,
    },
    patientName: {
      type: String,
      required: true,
      trim: true,
    },
    dob: {
      type: Date,
    },
    age: {
      type: Number,
      required: true,
    },
    gender: {
      type: String,
      required: true,
      enum: ['Male', 'Female', 'Other'],
    },
    mobileNumber: {
      type: String,
      required: true,
      match: [/^\d{10}$/, 'Mobile number must be exactly 10 digits'],
    },
    email: {
      type: String,
      default: '',
      trim: true,
    },
    address: {
      type: String,
      required: true,
    },
    serviceType: {
      type: String,
      enum: ['Laboratory', 'Radiology', 'Health Package', 'Multiple Services'],
      default: 'Laboratory',
    },
    serviceName: {
      type: String,
      default: '',
    },
    servicePrice: {
      type: Number,
      default: 0,
    },
    homeCollection: {
      type: Boolean,
      default: true,
    },
    test: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Test',
    },
    testName: {
      type: String,
      default: '',
    },
    testPrice: {
      type: Number,
      default: 0,
    },
    selectedServices: [
      {
        serviceType: {
          type: String,
          enum: ['Laboratory', 'Radiology', 'Health Package'],
          required: true,
        },
        serviceId: {
          type: mongoose.Schema.Types.ObjectId,
          required: true,
        },
        name: {
          type: String,
          required: true,
        },
        price: {
          type: Number,
          required: true,
        },
        category: {
          type: String,
          default: '',
        },
      },
    ],
    preferredDate: {
      type: Date,
      required: true,
    },
    preferredTime: {
      type: String,
      required: true,
    },
    sampleCollectedAt: {
      type: Date,
      default: null,
    },
    isArchived: {
      type: Boolean,
      default: false,
      index: true,
    },
    archivedAt: {
      type: Date,
      default: null,
    },
    archivedBy: {
      userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', default: null },
      username: { type: String, default: '' },
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
    additionalNotes: {
      type: String,
      default: '',
    },
    status: {
      type: String,
      enum: [
        'Pending',
        'Assigned',
        'Sample Collection Scheduled',
        'Sample Collected',
        'Processing',
        'Report Uploaded',
        'Completed',
        'Cancelled',
      ],
      default: 'Pending',
    },
    statusHistory: [
      {
        status: String,
        updatedAt: {
          type: Date,
          default: Date.now,
        },
        updatedBy: String,
      },
    ],
  },
  { timestamps: true }
);

module.exports = mongoose.model('Booking', bookingSchema);
