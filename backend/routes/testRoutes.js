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
  restoreTest,
} = require('../controllers/testController');
const { protect, admin, superAdmin } = require('../middleware/auth');

router.get('/', getTests);
router.get('/categories', getCategories);
router.get('/popular', getPopularTests);
router.get('/:id', getTestById);
router.post('/', protect, admin, createTest);
router.put('/:id', protect, admin, updateTest);
router.delete('/:id', protect, admin, deleteTest);
router.patch('/:id/toggle', protect, admin, toggleTestStatus);
router.put('/:id/restore', protect, superAdmin, restoreTest);

module.exports = router;
