const express = require('express');
const router = express.Router();
const {
  getSettings,
  updateSettings,
  updateSocialLinks,
} = require('../controllers/settingController');
const { protect, admin } = require('../middleware/auth');
const { upload } = require('../config/cloudinary');

const uploadFields = upload.fields([
  { name: 'logo', maxCount: 1 },
  { name: 'heroBanner', maxCount: 1 },
  { name: 'favicon', maxCount: 1 },
]);

router.get('/', getSettings);
router.put('/', protect, admin, uploadFields, updateSettings);
router.put('/social', protect, admin, updateSocialLinks);

module.exports = router;
