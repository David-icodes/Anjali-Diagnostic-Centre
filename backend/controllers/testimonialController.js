const Testimonial = require('../models/Testimonial');

const getTestimonials = async (req, res) => {
  try {
    const { isActive } = req.query;
    const query = {};

    if (isActive !== undefined) query.isActive = isActive === 'true';

    const testimonials = await Testimonial.find(query).sort({ createdAt: -1 });
    res.json(testimonials);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

const createTestimonial = async (req, res) => {
  try {
    const testimonial = await Testimonial.create(req.body);
    res.status(201).json(testimonial);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

const updateTestimonial = async (req, res) => {
  try {
    const testimonial = await Testimonial.findByIdAndUpdate(
      req.params.id,
      { $set: req.body },
      { new: true, runValidators: true }
    );

    if (!testimonial) {
      return res.status(404).json({ message: 'Testimonial not found' });
    }

    res.json(testimonial);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

const deleteTestimonial = async (req, res) => {
  try {
    const testimonial = await Testimonial.findById(req.params.id);

    if (!testimonial) {
      return res.status(404).json({ message: 'Testimonial not found' });
    }

    testimonial.isActive = false;
    await testimonial.save();
    res.json({ message: 'Testimonial deactivated successfully' });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

const toggleTestimonialStatus = async (req, res) => {
  try {
    const testimonial = await Testimonial.findById(req.params.id);

    if (!testimonial) {
      return res.status(404).json({ message: 'Testimonial not found' });
    }

    testimonial.isActive = !testimonial.isActive;
    const updatedTestimonial = await testimonial.save();
    res.json(updatedTestimonial);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

module.exports = {
  getTestimonials,
  createTestimonial,
  updateTestimonial,
  deleteTestimonial,
  toggleTestimonialStatus,
};
