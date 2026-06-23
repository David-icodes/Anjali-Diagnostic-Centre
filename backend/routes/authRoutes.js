const express = require('express');
const router = express.Router();
const {
  loginAdmin,
  getProfile,
  updateProfile,
  createStaff,
  getUsers,
  deleteUser,
} = require('../controllers/authController');
const { protect, admin } = require('../middleware/auth');

router.post('/login', loginAdmin);
router.get('/profile', protect, getProfile);
router.put('/profile', protect, updateProfile);
router.post('/staff', protect, admin, createStaff);
router.get('/users', protect, admin, getUsers);
router.delete('/users/:id', protect, admin, deleteUser);

module.exports = router;
