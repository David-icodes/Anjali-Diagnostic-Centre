const express = require('express');
const router = express.Router();
const { getReports, getReportById, downloadReport, uploadReport, deleteReport, restoreReport, searchReports } = require('../controllers/reportController');
const { protect, admin, superAdmin } = require('../middleware/auth');
const { pdfUpload } = require('../config/cloudinary');

router.get('/search', searchReports);
router.get('/download/:id', downloadReport);
router.get('/', protect, admin, getReports);
router.get('/:id', protect, admin, getReportById);
router.post('/upload', protect, admin, pdfUpload.single('pdf'), uploadReport);
router.delete('/:id', protect, admin, deleteReport);
router.put('/:id/restore', protect, superAdmin, restoreReport);

module.exports = router;
