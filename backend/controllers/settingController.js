const Setting = require('../models/Setting');
const { cloudinary } = require('../config/cloudinary');

const getSettings = async (req, res) => {
  try {
    let settings = await Setting.findOne();

    if (!settings) {
      settings = await Setting.create({});
    }

    res.json(settings);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

const updateSettings = async (req, res) => {
  try {
    let settings = await Setting.findOne();

    if (!settings) {
      settings = await Setting.create({});
    }

    const updateData = { ...req.body };

    if (req.files) {
      if (req.files.logo) {
        if (settings.logoPublicId) {
          await cloudinary.uploader.destroy(settings.logoPublicId);
        }
        updateData.logo = req.files.logo[0].path;
        updateData.logoPublicId = req.files.logo[0].filename;
      }

      if (req.files.heroBanner) {
        if (settings.heroBannerPublicId) {
          await cloudinary.uploader.destroy(settings.heroBannerPublicId);
        }
        updateData.heroBanner = req.files.heroBanner[0].path;
        updateData.heroBannerPublicId = req.files.heroBanner[0].filename;
      }

      if (req.files.favicon) {
        updateData.favicon = req.files.favicon[0].path;
      }
    }

    const updatedSettings = await Setting.findByIdAndUpdate(
      settings._id,
      { $set: updateData },
      { new: true, runValidators: true }
    );

    res.json(updatedSettings);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

const updateSocialLinks = async (req, res) => {
  try {
    let settings = await Setting.findOne();

    if (!settings) {
      settings = await Setting.create({});
    }

    const { facebook, instagram, whatsapp, youtube, linkedin, twitter } = req.body;

    settings.facebook = facebook || settings.facebook;
    settings.instagram = instagram || settings.instagram;
    settings.whatsapp = whatsapp || settings.whatsapp;
    settings.youtube = youtube || settings.youtube;
    settings.linkedin = linkedin || settings.linkedin;
    settings.twitter = twitter || settings.twitter;

    const updatedSettings = await settings.save();
    res.json(updatedSettings);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

module.exports = {
  getSettings,
  updateSettings,
  updateSocialLinks,
};
