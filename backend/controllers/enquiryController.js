const Enquiry = require('../models/Enquiry');

const createEnquiry = async (req, res) => {
  try {
    const enquiry = await Enquiry.create(req.body);
    res.status(201).json({
      success: true,
      message: 'Your enquiry has been submitted successfully. We will contact you soon.',
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

const getEnquiries = async (req, res) => {
  try {
    const { isRead, page = 1, limit = 10 } = req.query;
    const query = {};

    if (isRead !== undefined) query.isRead = isRead === 'true';

    const total = await Enquiry.countDocuments(query);
    const enquiries = await Enquiry.find(query)
      .sort({ createdAt: -1 })
      .skip((page - 1) * limit)
      .limit(parseInt(limit));

    res.json({
      enquiries,
      total,
      page: parseInt(page),
      pages: Math.ceil(total / limit),
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

const markAsRead = async (req, res) => {
  try {
    const enquiry = await Enquiry.findById(req.params.id);

    if (!enquiry) {
      return res.status(404).json({ message: 'Enquiry not found' });
    }

    enquiry.isRead = true;
    await enquiry.save();
    res.json({ message: 'Enquiry marked as read' });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

const deleteEnquiry = async (req, res) => {
  try {
    const enquiry = await Enquiry.findById(req.params.id);

    if (!enquiry) {
      return res.status(404).json({ message: 'Enquiry not found' });
    }

    await Enquiry.findByIdAndDelete(req.params.id);
    res.json({ message: 'Enquiry removed' });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

const getEnquiryStats = async (req, res) => {
  try {
    const total = await Enquiry.countDocuments();
    const unread = await Enquiry.countDocuments({ isRead: false });
    res.json({ total, unread });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

module.exports = {
  createEnquiry,
  getEnquiries,
  markAsRead,
  deleteEnquiry,
  getEnquiryStats,
};
