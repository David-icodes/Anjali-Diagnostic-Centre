const mongoose = require('mongoose');

const settingSchema = mongoose.Schema(
  {
    address: {
      type: String,
      default: '',
    },
    phone: {
      type: String,
      default: '',
    },
    email: {
      type: String,
      default: '',
    },
    workingHours: {
      type: String,
      default: 'Mon - Sat: 6:00 AM - 10:00 PM',
    },
    facebook: {
      type: String,
      default: '',
    },
    instagram: {
      type: String,
      default: '',
    },
    whatsapp: {
      type: String,
      default: '',
    },
    youtube: {
      type: String,
      default: '',
    },
    linkedin: {
      type: String,
      default: '',
    },
    twitter: {
      type: String,
      default: '',
    },
    aboutUs: {
      type: String,
      default: '',
    },
    vision: {
      type: String,
      default: '',
    },
    mission: {
      type: String,
      default: '',
    },
  },
  { timestamps: true }
);

module.exports = mongoose.model('Setting', settingSchema);
