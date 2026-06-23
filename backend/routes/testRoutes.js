const express = require('express');
const router = express.Router();
const {
  getTests,
  getTestById,
  createTest,
  updateTest,
  deleteTest,
  toggleTestStatus,
  getCategories,
  getPopularTests,
} = require('../controllers/testController');
const { protect, admin } = require('../middleware/auth');

router.get('/', getTests);
router.get('/categories', getCategories);
router.get('/popular', getPopularTests);
router.get('/:id', getTestById);
router.post('/', protect, admin, createTest);
router.put('/:id', protect, admin, updateTest);
router.delete('/:id', protect, admin, deleteTest);
router.patch('/:id/toggle', protect, admin, toggleTestStatus);

module.exports = router;
