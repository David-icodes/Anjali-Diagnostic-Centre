const Report = require('../models/Report');
const Booking = require('../models/Booking');
const ActivityLog = require('../models/ActivityLog');
const { cloudinary, uploadBufferToCloudinary } = require('../config/cloudinary');
const mongoose = require('mongoose');

const getDateRangeForDay = (value) => {
  if (!value) return null;

  const parsed = new Date(value);
  if (Number.isNaN(parsed.getTime())) return null;

  const start = new Date(Date.UTC(parsed.getUTCFullYear(), parsed.getUTCMonth(), parsed.getUTCDate()));
  const end = new Date(start);
  end.setUTCDate(end.getUTCDate() + 1);

  return { $gte: start, $lt: end };
};

const safeSerialize = (value) => {
  try {
    return JSON.parse(JSON.stringify(value));
  } catch {
    return { serializationError: true };
  }
};

const uploadPdfBufferToCloudinary = (buffer, bookingId) => new Promise((resolve, reject) => {
  logUploadStep('Cloudinary upload started', {
    bookingId,
    bufferBytes: buffer?.length || 0,
    resourceType: 'raw',
    folder: 'anjali-diagnostic/reports',
  });

  uploadBufferToCloudinary({
    buffer,
    folder: 'anjali-diagnostic/reports',
    resourceType: 'raw',
    type: 'upload',
    format: 'pdf',
    publicId: bookingId ? `${bookingId}-${Date.now()}` : undefined,
    overwrite: false,
    useFilename: false,
    uniqueFilename: true,
  })
    .then((result) => {
      logUploadStep('Cloudinary upload result', {
        bookingId,
        publicId: result?.public_id || null,
        secureUrl: result?.secure_url || null,
        resourceType: result?.resource_type || null,
        format: result?.format || null,
        type: result?.type || null,
        accessMode: result?.access_mode || null,
        accessControl: result?.access_control || null,
        bytes: result?.bytes || null,
        fullResponse: safeSerialize(result),
      });
      resolve(result);
    })
    .catch((error) => {
      logUploadStep('Cloudinary upload error', {
        bookingId,
        error: error.message,
        httpCode: error.http_code,
        name: error.name,
        fullError: safeSerialize({
          message: error.message,
          name: error.name,
          http_code: error.http_code,
          error,
        }),
      });
      reject(error);
    });
});

const sanitizeFilenamePart = (value) => (
  String(value || 'Patient')
    .trim()
    .replace(/[^a-zA-Z0-9-_ ]/g, '')
    .replace(/\s+/g, '_')
    .replace(/_+/g, '_')
    .replace(/^_+|_+$/g, '') || 'Patient'
);

const logDownloadStep = (message, meta = {}) => {
  console.log('[REPORT DOWNLOAD]', message, meta);
};

const logUploadStep = (message, meta = {}) => {
  console.log('[REPORT UPLOAD]', message, meta);
};

const buildPrivateDownloadUrl = (publicId) => cloudinary.utils.private_download_url(publicId, undefined, {
  resource_type: 'raw',
  type: 'upload',
  secure: true,
  expires_at: Math.floor(Date.now() / 1000) + 300,
});

const fetchCloudinaryFile = async (url) => {
  const response = await fetch(url, { redirect: 'follow' });
  const headers = Object.fromEntries(response.headers.entries());
  const errorBodyPreview = response.ok ? '' : (await response.text()).slice(0, 500);

  return {
    response,
    headers,
    errorBodyPreview,
  };
};

const sendDownloadError = (res, statusCode, step, message, extra = {}) => (
  res.status(statusCode).json({
    success: false,
    step,
    message,
    ...extra,
  })
);

const getReports = async (req, res) => {
  try {
    const { status, search, includeDeleted, page = 1, limit = 10 } = req.query;
    const query = { isDeleted: includeDeleted === 'true' ? { $in: [true, false] } : false };
    if (status) query.status = status;
    if (search) {
      const matchingBookings = await Booking.find({
        $or: [
          { bookingId: { $regex: search, $options: 'i' } },
          { patientName: { $regex: search, $options: 'i' } },
          { mobileNumber: { $regex: search, $options: 'i' } },
        ],
      }).select('_id');

      query.$or = [
        { patientName: { $regex: search, $options: 'i' } },
        { mobileNumber: { $regex: search, $options: 'i' } },
        { booking: { $in: matchingBookings.map((booking) => booking._id) } },
      ];
    }
    const total = await Report.countDocuments(query);
    const reports = await Report.find(query)
      .populate('booking', 'bookingId dob serviceName serviceType preferredDate sampleCollectedAt status')
      .sort({ createdAt: -1 })
      .skip((page - 1) * limit)
      .limit(parseInt(limit));
    res.json({ reports, total, page: parseInt(page), pages: Math.ceil(total / limit) });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

const getReportById = async (req, res) => {
  try {
    const report = await Report.findById(req.params.id).populate('booking', 'bookingId dob serviceName serviceType preferredDate sampleCollectedAt status');
    if (report) res.json(report);
    else res.status(404).json({ message: 'Report not found' });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

const downloadReport = async (req, res) => {
  try {
    logDownloadStep('Download request received', { reportId: req.params.id, ipAddress: req.ip });

    const report = await Report.findById(req.params.id).populate('booking', 'bookingId status');

    if (!report) {
      logDownloadStep('Report lookup failed', { reportId: req.params.id, reason: 'not_found' });
      return sendDownloadError(res, 404, 'report_lookup', 'Report not found in MongoDB');
    }

    if (report.isDeleted) {
      logDownloadStep('Report is archived', { reportId: report._id.toString(), bookingId: report.bookingId });
      return sendDownloadError(res, 404, 'report_lookup', 'Report is archived and cannot be downloaded');
    }

    if (report.status !== 'Uploaded') {
      logDownloadStep('Report status invalid for download', {
        reportId: report._id.toString(),
        bookingId: report.bookingId,
        status: report.status,
      });
      return sendDownloadError(res, 400, 'report_lookup', 'Report is not in Uploaded status', {
        reportStatus: report.status,
      });
    }

    logDownloadStep('Report found', {
      reportId: report._id.toString(),
      bookingId: report.bookingId,
      cloudinaryPublicId: report.publicId || report.cloudinaryPublicId || report.pdfPublicId || null,
      cloudinaryUrl: report.cloudinaryUrl || report.pdfUrl || null,
    });
    console.log('Report:', report);
    console.log('Cloudinary URL:', report.cloudinaryUrl || report.pdfUrl || null);
    console.log('Public ID:', report.publicId || report.cloudinaryPublicId || report.pdfPublicId || null);

    const storedCloudinaryUrl = report.cloudinaryUrl || report.pdfUrl;
    const publicId = report.publicId || report.cloudinaryPublicId || report.pdfPublicId;

    if (!storedCloudinaryUrl) {
      logDownloadStep('Cloudinary URL missing', { reportId: report._id.toString(), publicId });
      return sendDownloadError(res, 404, 'cloudinary_metadata', 'cloudinaryUrl is missing for this report', {
        hasPublicId: Boolean(publicId),
      });
    }

    if (!publicId) {
      logDownloadStep('Cloudinary public ID missing', { reportId: report._id.toString(), fileUrl: storedCloudinaryUrl });
      return sendDownloadError(res, 404, 'cloudinary_metadata', 'publicId is missing for this report', {
        cloudinaryUrl: storedCloudinaryUrl,
      });
    }

    try {
      const resource = await cloudinary.api.resource(publicId, { resource_type: 'raw' });
      logDownloadStep('Cloudinary resource lookup successful', {
        publicId,
        resolvedUrl: resource?.secure_url || storedCloudinaryUrl,
        bytes: resource?.bytes,
        format: resource?.format,
        resourceType: resource?.resource_type,
        type: resource?.type,
        accessMode: resource?.access_mode,
        accessControl: resource?.access_control,
      });
    } catch (cloudinaryError) {
      logDownloadStep('Cloudinary resource lookup failed', {
        publicId,
        error: cloudinaryError.message,
        httpCode: cloudinaryError.http_code,
      });
      return sendDownloadError(
        res,
        cloudinaryError.http_code === 404 ? 404 : 502,
        'cloudinary_resource_lookup',
        cloudinaryError.message || 'Cloudinary resource lookup failed',
        { publicId }
      );
    }

    logDownloadStep('Stored Cloudinary URL', { url: storedCloudinaryUrl });
    const privateUrl = buildPrivateDownloadUrl(publicId);
    logDownloadStep('Fetching report file from Cloudinary private download URL', {
      publicId,
      storedCloudinaryUrl,
    });
    let { response, headers, errorBodyPreview } = await fetchCloudinaryFile(privateUrl);

    logDownloadStep('Private Cloudinary download fetch completed', {
      publicId,
      status: response.status,
      ok: response.ok,
      headers,
      errorBodyPreview,
    });

    if (!response.ok) {
      const exactError = headers['x-cld-error'] || errorBodyPreview || `Cloudinary responded with status ${response.status}`;
      return sendDownloadError(res, response.status === 404 ? 404 : 502, 'cloudinary_fetch', exactError, {
        cloudinaryStatus: response.status,
        cloudinaryUrl: storedCloudinaryUrl,
        publicId,
        cloudinaryHeaders: headers,
        cloudinaryResponse: errorBodyPreview || null,
      });
    }

    const arrayBuffer = await response.arrayBuffer();
    const buffer = Buffer.from(arrayBuffer);
    const filename = `${sanitizeFilenamePart(report.patientName)}_Report.pdf`;

    res.setHeader('Content-Type', 'application/pdf');
    res.setHeader('Content-Disposition', `attachment; filename="${filename}"`);
    res.setHeader('Content-Length', buffer.length);
    logDownloadStep('File sent successfully', {
      reportId: report._id.toString(),
      filename,
      bytes: buffer.length,
    });
    logDownloadStep('Download endpoint response', {
      reportId: report._id.toString(),
      contentType: 'application/pdf',
      status: 200,
    });
    return res.send(buffer);
  } catch (error) {
    logDownloadStep('Download controller failed', {
      reportId: req.params.id,
      error: error.message,
      stack: error.stack,
    });
    return sendDownloadError(res, 500, 'download_controller', error.message);
  }
};

const uploadReport = async (req, res) => {
  try {
    logUploadStep('Upload Started', {
      bookingId: req.body?.bookingId || null,
      userId: req.user?._id?.toString?.() || null,
      username: req.user?.name || req.user?.username || null,
    });
    logUploadStep('req.file', req.file ? {
      fieldname: req.file.fieldname,
      originalname: req.file.originalname,
      path: req.file.path || null,
      mimetype: req.file.mimetype,
      size: req.file.size,
      hasBuffer: Boolean(req.file.buffer),
      bufferBytes: req.file.buffer?.length || 0,
    } : { file: null });
    logUploadStep('Uploaded filename', {
      originalname: req.file?.originalname || null,
    });

    const { bookingId } = req.body;
    const booking = await Booking.findOne({
      $or: [
        { bookingId },
        { _id: mongoose.isValidObjectId(bookingId) ? bookingId : null },
      ],
    });
    if (!booking) {
      logUploadStep('Booking lookup failed', { bookingId });
      return res.status(404).json({ message: 'Booking not found' });
    }

    if (!req.file) {
      logUploadStep('Upload blocked: req.file missing', { bookingId: booking.bookingId });
      return res.status(400).json({ message: 'PDF file is required' });
    }

    if (req.file.mimetype !== 'application/pdf') {
      logUploadStep('Upload blocked: invalid mimetype', {
        bookingId: booking.bookingId,
        mimetype: req.file.mimetype,
      });
      return res.status(400).json({ message: 'Only PDF reports are allowed' });
    }

    if (!['Sample Collected', 'Processing'].includes(booking.status)) {
      logUploadStep('Upload blocked: invalid booking status', {
        bookingId: booking.bookingId,
        status: booking.status,
      });
      return res.status(400).json({ message: 'Report upload is only allowed after sample collection.' });
    }

    const result = await uploadPdfBufferToCloudinary(req.file.buffer, booking.bookingId || booking._id?.toString());
    const pdfUrl = result?.secure_url || '';
    const pdfPublicId = result?.public_id || '';

    if (!pdfUrl || !pdfPublicId) {
      logUploadStep('Cloudinary upload result missing required fields', {
        bookingId: booking.bookingId,
        secureUrl: pdfUrl || null,
        publicId: pdfPublicId || null,
      });
      return res.status(502).json({
        message: 'Cloudinary upload did not return a secure URL and public ID. Report was not saved.',
      });
    }

    const reportData = {
      booking: booking._id,
      bookingId: booking.bookingId,
      patientName: booking.patientName,
      mobileNumber: booking.mobileNumber,
      dob: booking.dob || null,
      pdfUrl,
      pdfPublicId,
      cloudinaryUrl: pdfUrl,
      cloudinaryPublicId: pdfPublicId,
      publicId: pdfPublicId,
      status: 'Uploaded',
      uploadedBy: {
        userId: req.user?._id || null,
        username: req.user?.name || req.user?.username || '',
      },
      uploadedAt: new Date(),
      isDeleted: false,
      deletedAt: null,
      deletedBy: {
        userId: null,
        username: '',
      },
    };

    let report = await Report.findOne({ booking: booking._id });
    if (report) {
      Object.assign(report, reportData);
      await report.save();
      logUploadStep('MongoDB report updated after Cloudinary success', {
        reportId: report._id.toString(),
        bookingId: booking.bookingId,
        publicId: pdfPublicId,
      });
    } else {
      report = await Report.create(reportData);
      logUploadStep('MongoDB report created after Cloudinary success', {
        reportId: report._id.toString(),
        bookingId: booking.bookingId,
        publicId: pdfPublicId,
      });
    }

    logUploadStep('Saved MongoDB report document', {
      reportId: report._id.toString(),
      bookingId: report.bookingId,
      cloudinaryUrl: report.cloudinaryUrl,
      publicId: report.publicId || report.cloudinaryPublicId || report.pdfPublicId,
      uploadedAt: report.uploadedAt,
      uploadedBy: report.uploadedBy,
      status: report.status,
    });

    if (booking.status !== 'Completed') {
      booking.status = 'Report Uploaded';
      booking.statusHistory.push({ status: 'Report Uploaded', updatedBy: req.user.name });
      await booking.save();
      logUploadStep('Booking status updated to Report Uploaded', {
        bookingId: booking.bookingId,
      });
    }

    await ActivityLog.create({
      user: req.user._id,
      username: req.user.name,
      action: 'Report Uploaded',
      bookingId: booking.bookingId,
      details: `Uploaded report for booking ${booking.bookingId}`,
      ipAddress: req.ip,
    });

    const populatedReport = await Report.findById(report._id)
      .populate('booking', 'bookingId dob serviceName serviceType preferredDate sampleCollectedAt status');

    logUploadStep('Upload completed successfully', {
      reportId: report._id.toString(),
      bookingId: booking.bookingId,
      secureUrl: pdfUrl,
      publicId: pdfPublicId,
    });

    res.json(populatedReport);
  } catch (error) {
    logUploadStep('Upload failed', {
      bookingId: req.body?.bookingId || null,
      error: error.message,
      httpCode: error.http_code,
      stack: error.stack,
      fullError: safeSerialize({
        message: error.message,
        name: error.name,
        http_code: error.http_code,
        error,
      }),
    });
    return res.status(error.http_code || 500).json({
      message: error.message || 'Report upload failed',
      errorName: error.name || 'Error',
      httpCode: error.http_code || 500,
      source: 'cloudinary_upload',
    });
  }
};

const deleteReport = async (req, res) => {
  try {
    const report = await Report.findById(req.params.id);
    if (!report) return res.status(404).json({ message: 'Report not found' });
    report.isDeleted = true;
    report.deletedAt = new Date();
    report.deletedBy = {
      userId: req.user?._id || null,
      username: req.user?.name || req.user?.username || '',
    };
    await report.save();

    await ActivityLog.create({
      user: req.user?._id,
      username: req.user?.name || 'System',
      action: 'Report Archived',
      bookingId: report.bookingId,
      details: `Archived report for booking ${report.bookingId}`,
      ipAddress: req.ip,
    });

    res.json({ message: 'Report archived successfully' });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

const restoreReport = async (req, res) => {
  try {
    const report = await Report.findById(req.params.id);
    if (!report) return res.status(404).json({ message: 'Report not found' });

    report.isDeleted = false;
    report.deletedAt = null;
    report.deletedBy = { userId: null, username: '' };
    await report.save();

    await ActivityLog.create({
      user: req.user?._id,
      username: req.user?.name || 'System',
      action: 'Report Restored',
      bookingId: report.bookingId,
      details: `Restored report for booking ${report.bookingId}`,
      ipAddress: req.ip,
    });

    res.json({ message: 'Report restored successfully' });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

const searchReports = async (req, res) => {
  try {
    const { patientName, mobileNumber, dob } = req.method === 'GET' ? req.query : req.body;
    if (!patientName || !mobileNumber || !dob) {
      return res.status(400).json({ message: 'Patient name, mobile number, and date of birth are required' });
    }

    const dobRange = getDateRangeForDay(dob);
    if (!dobRange) {
      return res.status(400).json({ message: 'Invalid date of birth' });
    }

    const matchingBookings = await Booking.find({
      patientName: patientName.trim(),
      mobileNumber: mobileNumber.trim(),
      dob: dobRange,
      status: { $in: ['Report Uploaded', 'Completed'] },
    }).select('_id bookingId serviceName serviceType preferredDate status dob');

    if (matchingBookings.length === 0) {
      return res.json([]);
    }

    const reports = await Report.find({
      booking: { $in: matchingBookings.map((booking) => booking._id) },
      status: 'Uploaded',
      isDeleted: false,
    })
      .populate('booking', 'bookingId dob serviceName serviceType preferredDate status')
      .sort({ createdAt: -1 });

    if (reports.length > 0) {
      await Promise.all(
        reports.map((report) => ActivityLog.create({
          action: 'Report Downloaded',
          username: report.patientName,
          bookingId: report.booking?.bookingId || '',
          details: `Public report lookup for booking ${report.booking?.bookingId || 'unknown'}`,
          ipAddress: req.ip,
        }))
      );
    }

    res.json(reports);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

module.exports = { getReports, getReportById, downloadReport, uploadReport, deleteReport, restoreReport, searchReports };
