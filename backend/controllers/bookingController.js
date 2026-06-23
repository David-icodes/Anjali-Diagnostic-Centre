const Booking = require('../models/Booking');
const Test = require('../models/Test');

const generateBookingId = () => {
  const prefix = 'ADC';
  const timestamp = Date.now().toString(36).toUpperCase();
  const random = Math.random().toString(36).substring(2, 6).toUpperCase();
  return `${prefix}-${timestamp}${random}`;
};

const createBooking = async (req, res) => {
  try {
    const test = await Test.findById(req.body.testId);

    if (!test) {
      return res.status(404).json({ message: 'Test not found' });
    }

    const bookingData = {
      bookingId: generateBookingId(),
      patientName: req.body.patientName,
      age: req.body.age,
      gender: req.body.gender,
      mobileNumber: req.body.mobileNumber,
      email: req.body.email,
      address: req.body.address,
      test: test._id,
      testName: test.name,
      testPrice: test.offerPrice || test.originalPrice,
      preferredDate: req.body.preferredDate,
      preferredTime: req.body.preferredTime,
      additionalNotes: req.body.additionalNotes || '',
    };

    const booking = await Booking.create(bookingData);

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
    const { status, search, page = 1, limit = 10 } = req.query;
    const query = {};

    if (status) query.status = status;
    if (search) {
      query.$or = [
        { bookingId: { $regex: search, $options: 'i' } },
        { patientName: { $regex: search, $options: 'i' } },
        { mobileNumber: { $regex: search, $options: 'i' } },
      ];
    }

    const total = await Booking.countDocuments(query);
    const bookings = await Booking.find(query)
      .populate('test', 'name category')
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
    const booking = await Booking.findById(req.params.id).populate(
      'test',
      'name category image'
    );

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
    const { bookingId, mobileNumber } = req.body;

    const booking = await Booking.findOne({
      bookingId,
      mobileNumber,
    }).populate('test', 'name category image originalPrice offerPrice');

    if (booking) {
      res.json(booking);
    } else {
      res.status(404).json({ message: 'Booking not found. Please check your Booking ID and Mobile Number.' });
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
      'Pending',
      'Confirmed',
      'Sample Collection Scheduled',
      'Sample Collected',
      'Processing',
      'Report Ready',
      'Completed',
      'Cancelled',
    ];

    if (!validStatuses.includes(status)) {
      return res.status(400).json({ message: 'Invalid status' });
    }

    booking.status = status;
    booking.statusHistory.push({
      status,
      updatedBy: req.user ? req.user.name : 'System',
    });

    const updatedBooking = await booking.save();
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

    await Booking.findByIdAndDelete(req.params.id);
    res.json({ message: 'Booking removed' });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

const getBookingStats = async (req, res) => {
  try {
    const total = await Booking.countDocuments();
    const pending = await Booking.countDocuments({ status: 'Pending' });
    const completed = await Booking.countDocuments({ status: 'Completed' });
    const cancelled = await Booking.countDocuments({ status: 'Cancelled' });
    const processing = await Booking.countDocuments({ status: 'Processing' });
    const reportReady = await Booking.countDocuments({ status: 'Report Ready' });

    const monthlyBookings = await Booking.aggregate([
      {
        $group: {
          _id: {
            year: { $year: '$createdAt' },
            month: { $month: '$createdAt' },
          },
          count: { $sum: 1 },
          revenue: { $sum: '$testPrice' },
        },
      },
      { $sort: { '_id.year': -1, '_id.month': -1 } },
      { $limit: 12 },
    ]);

    const popularTests = await Booking.aggregate([
      {
        $group: {
          _id: '$testName',
          count: { $sum: 1 },
        },
      },
      { $sort: { count: -1 } },
      { $limit: 10 },
    ]);

    const statusDistribution = await Booking.aggregate([
      {
        $group: {
          _id: '$status',
          count: { $sum: 1 },
        },
      },
    ]);

    res.json({
      total,
      pending,
      completed,
      cancelled,
      processing,
      reportReady,
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
