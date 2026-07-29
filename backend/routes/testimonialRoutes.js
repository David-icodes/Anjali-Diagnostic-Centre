const express = require('express');
const router = express.Router();
const {
  getTestimonials,
  createTestimonial,
  updateTestimonial,
  deleteTestimonial,
  toggleTestimonialStatus,
} = require('../controllers/testimonialController');
const { protect, admin } = require('../middleware/auth');

router.get('/', getTestimonials);
router.post('/', protect, admin, createTestimonial);
router.put('/:id', protect, admin, updateTestimonial);
router.delete('/:id', protect, admin, deleteTestimonial);
router.patch('/:id/toggle', protect, admin, toggleTestimonialStatus);

module.exports = router;
