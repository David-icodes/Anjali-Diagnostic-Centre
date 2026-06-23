const express = require('express');
const router = express.Router();
const {
  createEnquiry,
  getEnquiries,
  markAsRead,
  deleteEnquiry,
  getEnquiryStats,
} = require('../controllers/enquiryController');
const { protect, admin } = require('../middleware/auth');

router.post('/', createEnquiry);
router.get('/stats', protect, admin, getEnquiryStats);
router.get('/', protect, admin, getEnquiries);
router.put('/:id/read', protect, admin, markAsRead);
router.delete('/:id', protect, admin, deleteEnquiry);

module.exports = router;
