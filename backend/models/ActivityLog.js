const mongoose = require('mongoose');

const activityLogSchema = mongoose.Schema({
  user: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
  username: { type: String },
  action: { type: String, required: true },
  bookingId: { type: String, default: '' },
  details: { type: String, default: '' },
  ipAddress: { type: String, default: '' },
  isArchived: { type: Boolean, default: false, index: true },
  archivedAt: { type: Date, default: null },
  archivedBy: {
    userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', default: null },
    username: { type: String, default: '' },
  },
}, { timestamps: true });

module.exports = mongoose.model('ActivityLog', activityLogSchema);
