const Booking = require('../models/Booking');
const Test = require('../models/Test');
const RadiologyService = require('../models/RadiologyService');
const HealthPackage = require('../models/HealthPackage');
const Revenue = require('../models/Revenue');
const ActivityLog = require('../models/ActivityLog');
const User = require('../models/User');
const Report = require('../models/Report');
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

const generateBookingId = async () => {
  const now = new Date();
  const datePart = `${now.getFullYear()}${String(now.getMonth() + 1).padStart(2, '0')}${String(now.getDate()).padStart(2, '0')}`;
  const prefix = `ADC-${datePart}-`;
  const latestBooking = await Booking.findOne({
    bookingId: { $regex: `^${prefix}\\d{4}$` },
  }).sort({ bookingId: -1 }).select('bookingId');

  const latestSequence = latestBooking?.bookingId ? Number(latestBooking.bookingId.split('-').pop()) : 0;
  const nextSequence = String(latestSequence + 1).padStart(4, '0');

  return `${prefix}${nextSequence}`;
};

const createBookingWithGeneratedId = async (bookingData) => {
  for (let attempt = 0; attempt < 5; attempt += 1) {
    try {
      return await Booking.create({
        ...bookingData,
        bookingId: await generateBookingId(),
      });
    } catch (error) {
      if (error?.code !== 11000 || !error?.keyPattern?.bookingId) {
        throw error;
      }
    }
  }

  throw new Error('Unable to generate a unique booking ID. Please try again.');
};

const createBooking = async (req, res) => {
  try {
    const { serviceType, testId, radiologyId, packageId, dob } = req.body;
    let serviceName = '';
    let servicePrice = 0;

    if (!dob) {
      return res.status(400).json({ message: 'Date of birth is required' });
    }

    const parsedDob = new Date(dob);
    if (Number.isNaN(parsedDob.getTime())) {
      return res.status(400).json({ message: 'Invalid date of birth' });
    }

    if (serviceType === 'Laboratory' && testId) {
      const test = await Test.findById(testId);
      if (!test) return res.status(404).json({ message: 'Test not found' });
      serviceName = test.name;
      servicePrice = test.offerPrice || test.originalPrice;
    } else if (serviceType === 'Radiology' && radiologyId) {
      const rad = await RadiologyService.findById(radiologyId);
      if (!rad) return res.status(404).json({ message: 'Radiology service not found' });
      serviceName = rad.name;
      servicePrice = rad.price;
    } else if (serviceType === 'Health Package' && packageId) {
      const pkg = await HealthPackage.findById(packageId);
      if (!pkg) return res.status(404).json({ message: 'Health package not found' });
      serviceName = pkg.name;
      servicePrice = pkg.offerPrice;
    } else {
      return res.status(400).json({ message: 'Invalid service selection' });
    }

    const bookingData = {
      patientName: req.body.patientName,
      dob: parsedDob,
      age: req.body.age,
      gender: req.body.gender,
      mobileNumber: req.body.mobileNumber,
      email: req.body.email,
      address: req.body.address,
      serviceType: serviceType || 'Laboratory',
      serviceName,
      servicePrice,
      homeCollection: req.body.homeCollection !== undefined ? req.body.homeCollection : true,
      test: testId || undefined,
      testName: serviceType === 'Laboratory' ? serviceName : '',
      testPrice: serviceType === 'Laboratory' ? servicePrice : 0,
      preferredDate: req.body.preferredDate,
      preferredTime: req.body.preferredTime,
      additionalNotes: req.body.additionalNotes || '',
    };

    const booking = await createBookingWithGeneratedId(bookingData);

    await ActivityLog.create({
      user: req.user?._id,
      username: req.user?.name || 'Guest',
      action: 'Booking Created',
      bookingId: booking.bookingId,
      details: `Booking ${booking.bookingId} created for ${booking.patientName}`,
      ipAddress: req.ip,
    });

    res.status(201).json({
      success: true,
      booking,
      message: 'Booking created successfully',
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

const getBookings = async (req, res) => {
  try {
    const { status, search, serviceType, dob, page = 1, limit = 10 } = req.query;
    const query = { isArchived: { $ne: true } };

    if (status && status.trim()) query.status = status;
    if (serviceType) query.serviceType = serviceType;
    const dobRange = getDateRangeForDay(dob);
    if (dobRange) query.dob = dobRange;
    if (search) {
      query.$or = [
        { bookingId: { $regex: search, $options: 'i' } },
        { patientName: { $regex: search, $options: 'i' } },
        { mobileNumber: { $regex: search, $options: 'i' } },
      ];
    }

    const total = await Booking.countDocuments(query);
    const bookings = await Booking.find(query)
      .sort({ createdAt: -1 })
      .skip((page - 1) * limit)
      .limit(parseInt(limit));

    res.json({
      bookings,
      total,
      page: parseInt(page),
      pages: Math.ceil(total / limit),
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

const getBookingById = async (req, res) => {
  try {
    const booking = await Booking.findOne({
      $or: [
        { _id: mongoose.isValidObjectId(req.params.id) ? req.params.id : null },
        { bookingId: req.params.id },
      ],
    });
    if (booking) {
      res.json(booking);
    } else {
      res.status(404).json({ message: 'Booking not found' });
    }
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

const trackBooking = async (req, res) => {
  try {
    const { patientName, mobileNumber } = req.method === 'GET' ? req.query : req.body;

    const booking = await Booking.findOne({
      isArchived: { $ne: true },
      patientName: { $regex: patientName, $options: 'i' },
      mobileNumber,
    }).sort({ createdAt: -1 });

    if (booking) {
      res.json(booking);
    } else {
      res.status(404).json({ message: 'No bookings found. Please check your Name and Mobile Number.' });
    }
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

const updateBookingStatus = async (req, res) => {
  try {
    const { status } = req.body;
    const booking = await Booking.findById(req.params.id);

    if (!booking) {
      return res.status(404).json({ message: 'Booking not found' });
    }

    const validStatuses = [
      'Pending', 'Assigned', 'Sample Collection Scheduled',
      'Sample Collected', 'Processing', 'Report Uploaded',
      'Completed', 'Cancelled',
    ];

    if (!validStatuses.includes(status)) {
      return res.status(400).json({ message: 'Invalid status' });
    }

    const previousStatus = booking.status;
    booking.status = status;

    if (status === 'Sample Collected' && previousStatus !== 'Sample Collected') {
      booking.sampleCollectedAt = new Date();
    }

    booking.statusHistory.push({
      status,
      updatedBy: req.user ? req.user.name : 'System',
    });

    const updatedBooking = await booking.save();

    if (status === 'Completed' && previousStatus !== 'Completed') {
      const existingRevenue = await Revenue.findOne({ booking: booking._id });
      if (!existingRevenue) {
        await Revenue.create({
          booking: booking._id,
          amount: booking.servicePrice,
          date: new Date(),
          description: `Booking ${booking.bookingId} - ${booking.serviceName}`,
          isActive: true,
          deactivatedAt: null,
        });
      } else if (!existingRevenue.isActive) {
        existingRevenue.isActive = true;
        existingRevenue.deactivatedAt = null;
        existingRevenue.amount = booking.servicePrice;
        existingRevenue.description = `Booking ${booking.bookingId} - ${booking.serviceName}`;
        existingRevenue.date = new Date();
        await existingRevenue.save();
      }
    }

    if (status === 'Cancelled' && previousStatus === 'Completed') {
      await Revenue.updateOne(
        { booking: booking._id, isActive: true },
        {
          $set: {
            isActive: false,
            deactivatedAt: new Date(),
          },
        }
      );
    }

    const activityAction =
      status === 'Sample Collected' && previousStatus !== 'Sample Collected'
        ? 'Sample Collected'
        : status === 'Completed' && previousStatus !== 'Completed'
          ? 'Booking Completed'
          : 'Booking Updated';

    await ActivityLog.create({
      user: req.user?._id,
      username: req.user?.name || 'System',
      action: activityAction,
      bookingId: booking.bookingId,
      details: `Booking ${booking.bookingId} status changed from ${previousStatus} to ${status}`,
      ipAddress: req.ip,
    });

    res.json(updatedBooking);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

const deleteBooking = async (req, res) => {
  try {
    const booking = await Booking.findById(req.params.id);

    if (!booking) {
      return res.status(404).json({ message: 'Booking not found' });
    }

    const bookingObjectId = booking._id;
    const bookingId = booking.bookingId;

    await Revenue.deleteMany({ booking: bookingObjectId });
    await Report.deleteMany({ booking: bookingObjectId });
    await Booking.deleteOne({ _id: bookingObjectId });

    await ActivityLog.create({
      user: req.user?._id,
      username: req.user?.name || 'System',
      action: 'Booking Deleted',
      bookingId,
      details: `Permanently deleted booking ${bookingId}`,
      ipAddress: req.ip,
    });

    res.json({ message: 'Booking deleted successfully', bookingId });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

const getBookingStats = async (req, res) => {
  try {
    const activeBookingQuery = { isArchived: { $ne: true } };
    const total = await Booking.countDocuments(activeBookingQuery);
    const pending = await Booking.countDocuments({ ...activeBookingQuery, status: 'Pending' });
    const assigned = await Booking.countDocuments({ ...activeBookingQuery, status: 'Assigned' });
    const sampleCollected = await Booking.countDocuments({ ...activeBookingQuery, status: 'Sample Collected' });
    const processing = await Booking.countDocuments({ ...activeBookingQuery, status: 'Processing' });
    const reportUploaded = await Booking.countDocuments({ ...activeBookingQuery, status: 'Report Uploaded' });
    const completed = await Booking.countDocuments({ ...activeBookingQuery, status: 'Completed' });
    const cancelled = await Booking.countDocuments({ ...activeBookingQuery, status: 'Cancelled' });

    const labBookings = await Booking.countDocuments({ ...activeBookingQuery, serviceType: 'Laboratory' });
    const radiologyBookings = await Booking.countDocuments({ ...activeBookingQuery, serviceType: 'Radiology' });
    const healthPackageBookings = await Booking.countDocuments({ ...activeBookingQuery, serviceType: 'Health Package' });

    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const sampleCollectionsToday = await Booking.countDocuments({
      ...activeBookingQuery,
      status: 'Sample Collection Scheduled',
      preferredDate: { $gte: today },
    });

    const revenueResult = await Booking.aggregate([
      { $match: { ...activeBookingQuery, status: 'Completed' } },
      { $group: { _id: null, total: { $sum: '$servicePrice' } } },
    ]);
    const totalRevenue = revenueResult.length > 0 ? revenueResult[0].total : 0;

    const dailyRevenueResult = await Booking.aggregate([
      { $match: { ...activeBookingQuery, status: 'Completed', updatedAt: { $gte: today } } },
      { $group: { _id: null, total: { $sum: '$servicePrice' } } },
    ]);
    const dailyRevenue = dailyRevenueResult.length > 0 ? dailyRevenueResult[0].total : 0;

    const monthlyRevenue = await Booking.aggregate([
      { $match: { ...activeBookingQuery, status: 'Completed' } },
      {
        $group: {
          _id: { year: { $year: '$updatedAt' }, month: { $month: '$updatedAt' } },
          total: { $sum: '$servicePrice' },
        },
      },
      { $sort: { '_id.year': -1, '_id.month': -1 } },
      { $limit: 12 },
    ]);

    const monthlyBookings = await Booking.aggregate([
      { $match: activeBookingQuery },
      {
        $group: {
          _id: { year: { $year: '$createdAt' }, month: { $month: '$createdAt' } },
          count: { $sum: 1 },
          revenue: { $sum: '$servicePrice' },
        },
      },
      { $sort: { '_id.year': -1, '_id.month': -1 } },
      { $limit: 12 },
    ]);

    const popularTests = await Booking.aggregate([
      { $match: activeBookingQuery },
      { $group: { _id: '$serviceName', count: { $sum: 1 } } },
      { $sort: { count: -1 } },
      { $limit: 10 },
    ]);

    const statusDistribution = await Booking.aggregate([
      { $match: activeBookingQuery },
      { $group: { _id: '$status', count: { $sum: 1 } } },
    ]);

    const totalUsers = await User.countDocuments();
    const recentReports = await Report.find({ status: 'Uploaded', isDeleted: false })
      .populate('booking', 'bookingId')
      .sort({ createdAt: -1 })
      .limit(5);

    res.json({
      totalUsers,
      recentReports,
      total,
      pending,
      assigned,
      sampleCollected,
      processing,
      reportUploaded,
      completed,
      cancelled,
      labBookings,
      radiologyBookings,
      healthPackageBookings,
      sampleCollectionsToday,
      totalRevenue,
      dailyRevenue,
      monthlyRevenue,
      monthlyBookings,
      popularTests,
      statusDistribution,
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

module.exports = {
  createBooking,
  getBookings,
  getBookingById,
  trackBooking,
  updateBookingStatus,
  deleteBooking,
  getBookingStats,
};
