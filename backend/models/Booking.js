const mongoose = require('mongoose');

const bookingSchema = mongoose.Schema(
  {
    bookingId: {
      type: String,
      required: true,
      unique: true,
    },
    patientName: {
      type: String,
      required: true,
      trim: true,
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
    },
    email: {
      type: String,
      required: true,
    },
    address: {
      type: String,
      required: true,
    },
    test: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Test',
      required: true,
    },
    testName: {
      type: String,
      required: true,
    },
    testPrice: {
      type: Number,
      required: true,
    },
    preferredDate: {
      type: Date,
      required: true,
    },
    preferredTime: {
      type: String,
      required: true,
    },
    additionalNotes: {
      type: String,
      default: '',
    },
    status: {
      type: String,
      enum: [
        'Pending',
        'Confirmed',
        'Sample Collection Scheduled',
        'Sample Collected',
        'Processing',
        'Report Ready',
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

bookingSchema.pre('save', function (next) {
  if (this.isModified('status')) {
    this.statusHistory.push({
      status: this.status,
      updatedBy: 'System',
    });
  }
  next();
});

module.exports = mongoose.model('Booking', bookingSchema);
