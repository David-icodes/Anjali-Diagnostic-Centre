const express = require('express');
const router = express.Router();
const {
  createBooking,
  getBookings,
  getBookingById,
  trackBooking,
  updateBookingStatus,
  deleteBooking,
  restoreBooking,
  getBookingStats,
} = require('../controllers/bookingController');
const { protect, admin, adminOnly, superAdmin } = require('../middleware/auth');

router.post('/', createBooking);
router.get('/track', trackBooking);
router.post('/track', trackBooking);
router.get('/stats', protect, admin, getBookingStats);
router.get('/', protect, admin, getBookings);
router.get('/:id', protect, admin, getBookingById);
router.put('/:id/status', protect, admin, updateBookingStatus);
router.delete('/:id', protect, adminOnly, deleteBooking);
router.put('/:id/restore', protect, superAdmin, restoreBooking);

module.exports = router;
