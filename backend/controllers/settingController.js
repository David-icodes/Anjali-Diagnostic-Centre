const Setting = require('../models/Setting');

const responseFields = [
  'address',
  'phone',
  'email',
  'workingHours',
  'facebook',
  'instagram',
  'whatsapp',
  'youtube',
  'linkedin',
  'twitter',
  'aboutUs',
  'vision',
  'mission',
];

const sanitizeSettings = (settings) => (
  responseFields.reduce((acc, field) => {
    acc[field] = settings?.[field] || '';
    return acc;
  }, {})
);

const getSettings = async (req, res) => {
  try {
    let settings = await Setting.findOne();

    if (!settings) {
      settings = await Setting.create({});
    }

    res.json(sanitizeSettings(settings));
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

const updateSettings = async (req, res) => {
  try {
    let settings = await Setting.findOne();

    if (!settings) {
      settings = new Setting();
    }

    responseFields.forEach((field) => {
      if (req.body[field] !== undefined) {
        settings[field] = req.body[field];
      }
    });

    const updated = await settings.save();
    res.json(sanitizeSettings(updated));
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

const updateSocialLinks = async (req, res) => {
  try {
    let settings = await Setting.findOne();

    if (!settings) {
      settings = new Setting();
    }

    ['facebook', 'instagram', 'whatsapp', 'youtube', 'linkedin', 'twitter'].forEach((field) => {
      if (req.body[field] !== undefined) {
        settings[field] = req.body[field];
      }
    });

    const updated = await settings.save();
    res.json(sanitizeSettings(updated));
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

module.exports = {
  getSettings,
  updateSettings,
  updateSocialLinks,
};
