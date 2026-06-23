const mongoose = require('mongoose');

const settingSchema = mongoose.Schema(
  {
    siteName: {
      type: String,
      default: 'Anjali Diagnostic Centre',
    },
    tagline: {
      type: String,
      default: 'Your Health, Our Priority',
    },
    logo: {
      type: String,
      default: '',
    },
    logoPublicId: {
      type: String,
      default: '',
    },
    favicon: {
      type: String,
      default: '',
    },
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
      default: 'Mon - Sat: 7:00 AM - 9:00 PM',
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
    heroTitle: {
      type: String,
      default: 'Advanced Diagnostic Care You Can Trust',
    },
    heroSubtitle: {
      type: String,
      default: 'State-of-the-art laboratory with accurate results, care, and compassion.',
    },
    heroBanner: {
      type: String,
      default: '',
    },
    heroBannerPublicId: {
      type: String,
      default: '',
    },
  },
  { timestamps: true }
);

module.exports = mongoose.model('Setting', settingSchema);
