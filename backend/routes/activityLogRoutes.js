const express = require('express');
const router = express.Router();
const {
  getActivityLogs,
  deleteActivityLog,
  deleteSelectedActivityLogs,
  clearAllActivityLogs,
  restoreActivityLog,
} = require('../controllers/activityLogController');
const { protect, admin, adminOnly, superAdmin } = require('../middleware/auth');

router.get('/', protect, admin, getActivityLogs);
router.post('/delete-selected', protect, adminOnly, deleteSelectedActivityLogs);
router.delete('/', protect, adminOnly, clearAllActivityLogs);
router.delete('/:id', protect, adminOnly, deleteActivityLog);
router.put('/:id/restore', protect, superAdmin, restoreActivityLog);

module.exports = router;
