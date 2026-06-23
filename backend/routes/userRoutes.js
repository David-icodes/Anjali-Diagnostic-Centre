const express = require('express');
const router = express.Router();
const { getUsers, updateUser, deleteUser } = require('../controllers/authController');
const { protect, adminOnly } = require('../middleware/auth');

router.get('/', protect, adminOnly, getUsers);
router.put('/:id', protect, adminOnly, updateUser);
router.delete('/:id', protect, adminOnly, deleteUser);

module.exports = router;
