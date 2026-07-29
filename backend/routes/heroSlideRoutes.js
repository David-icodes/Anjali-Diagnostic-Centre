const express = require('express');
const router = express.Router();
const {
  getHeroSlides,
  createHeroSlide,
  updateHeroSlide,
  deleteHeroSlide,
  toggleHeroSlideStatus,
} = require('../controllers/heroSlideController');
const { protect, admin } = require('../middleware/auth');
const { upload } = require('../config/cloudinary');

router.get('/', getHeroSlides);
router.post('/', protect, admin, upload.single('image'), createHeroSlide);
router.put('/:id', protect, admin, upload.single('image'), updateHeroSlide);
router.delete('/:id', protect, admin, deleteHeroSlide);
router.patch('/:id/toggle', protect, admin, toggleHeroSlideStatus);

module.exports = router;
