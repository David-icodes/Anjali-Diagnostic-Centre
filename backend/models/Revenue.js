const mongoose = require('mongoose');

const revenueSchema = mongoose.Schema(
  {
    booking: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Booking',
      required: true,
    },
    amount: { type: Number, required: true },
    date: { type: Date, default: Date.now },
    description: { type: String, default: '' },
    isActive: { type: Boolean, default: true },
    deactivatedAt: { type: Date, default: null },
  },
  { timestamps: true }
);

revenueSchema.index({ date: -1 });
revenueSchema.index({ booking: 1 });

module.exports = mongoose.model('Revenue', revenueSchema);
