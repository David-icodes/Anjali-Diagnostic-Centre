const express = require('express');
const router = express.Router();
const {
  createBooking,
  getBookings,
  getBookingById,
  trackBooking,
  updateBookingStatus,
  deleteBooking,
  getBookingStats,
} = require('../controllers/bookingController');
const { protect, admin } = require('../middleware/auth');

router.post('/', createBooking);
router.post('/track', trackBooking);
router.get('/stats', protect, admin, getBookingStats);
router.get('/', protect, admin, getBookings);
router.get('/:id', protect, admin, getBookingById);
router.put('/:id/status', protect, admin, updateBookingStatus);
router.delete('/:id', protect, admin, deleteBooking);

module.exports = router;
