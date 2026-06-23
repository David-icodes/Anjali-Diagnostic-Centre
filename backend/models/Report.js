const mongoose = require('mongoose');

const reportSchema = mongoose.Schema({
  booking: { type: mongoose.Schema.Types.ObjectId, ref: 'Booking', required: true },
  bookingId: { type: String, default: '', index: true },
  patientName: { type: String, required: true },
  mobileNumber: { type: String, required: true },
  dob: { type: Date, default: null },
  pdfUrl: { type: String, default: '' },
  pdfPublicId: { type: String, default: '' },
  cloudinaryUrl: { type: String, default: '' },
  cloudinaryPublicId: { type: String, default: '' },
  publicId: { type: String, default: '' },
  uploadedBy: {
    userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', default: null },
    username: { type: String, default: '' },
  },
  uploadedAt: { type: Date, default: null },
  status: { type: String, enum: ['Pending', 'Uploaded'], default: 'Pending' },
  isDeleted: { type: Boolean, default: false, index: true },
  deletedAt: { type: Date, default: null },
  deletedBy: {
    userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', default: null },
    username: { type: String, default: '' },
  },
}, { timestamps: true });

module.exports = mongoose.model('Report', reportSchema);
