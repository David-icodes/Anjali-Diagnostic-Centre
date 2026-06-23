const express = require('express');
const router = express.Router();
const {
  getOffers,
  getOfferById,
  createOffer,
  updateOffer,
  deleteOffer,
  toggleOfferStatus,
} = require('../controllers/offerController');
const { protect, admin } = require('../middleware/auth');
const { upload } = require('../config/cloudinary');

router.get('/', getOffers);
router.get('/:id', getOfferById);
router.post('/', protect, admin, upload.single('image'), createOffer);
router.put('/:id', protect, admin, upload.single('image'), updateOffer);
router.delete('/:id', protect, admin, deleteOffer);
router.patch('/:id/toggle', protect, admin, toggleOfferStatus);

module.exports = router;
