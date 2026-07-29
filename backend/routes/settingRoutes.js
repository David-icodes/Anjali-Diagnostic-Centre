const express = require('express');
const router = express.Router();
const {
  getSettings,
  updateSettings,
  updateSocialLinks,
} = require('../controllers/settingController');
const { protect, admin } = require('../middleware/auth');

router.get('/', getSettings);
router.put('/', protect, admin, updateSettings);
router.put('/social', protect, admin, updateSocialLinks);

module.exports = router;
