const express = require('express');
const router = express.Router();
const {
  getRadiologyServices, getRadiologyServiceById, createRadiologyService,
  updateRadiologyService, deleteRadiologyService,
} = require('../controllers/radiologyController');
const { protect, admin } = require('../middleware/auth');

router.get('/', getRadiologyServices);
router.get('/:id', getRadiologyServiceById);
router.post('/', protect, admin, createRadiologyService);
router.put('/:id', protect, admin, updateRadiologyService);
router.delete('/:id', protect, admin, deleteRadiologyService);

module.exports = router;
