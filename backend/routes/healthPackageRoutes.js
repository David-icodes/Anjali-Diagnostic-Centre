const express = require('express');
const router = express.Router();
const {
  getHealthPackages, getHealthPackageById, createHealthPackage,
  updateHealthPackage, deleteHealthPackage,
} = require('../controllers/healthPackageController');
const { protect, admin } = require('../middleware/auth');

router.get('/', getHealthPackages);
router.get('/:id', getHealthPackageById);
router.post('/', protect, admin, createHealthPackage);
router.put('/:id', protect, admin, updateHealthPackage);
router.delete('/:id', protect, admin, deleteHealthPackage);

module.exports = router;
