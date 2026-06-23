const express = require('express');
const router = express.Router();
const {
  loginAdmin,
  getProfile,
  updateProfile,
  createStaff,
  getUsers,
  updateUser,
  deleteUser,
} = require('../controllers/authController');
const { protect, adminOnly, superAdmin } = require('../middleware/auth');

router.post('/login', loginAdmin);
router.get('/profile', protect, getProfile);
router.put('/profile', protect, updateProfile);
router.post('/staff', protect, adminOnly, createStaff);
router.get('/users', protect, adminOnly, getUsers);
router.put('/users/:id', protect, adminOnly, updateUser);
router.delete('/users/:id', protect, adminOnly, deleteUser);

module.exports = router;
