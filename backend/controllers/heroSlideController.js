const HeroSlide = require('../models/HeroSlide');
const { uploadBufferToCloudinary } = require('../config/cloudinary');

const uploadHeroImage = async (file, slideIdHint) => {
  if (!file?.buffer) return null;

  const result = await uploadBufferToCloudinary({
    buffer: file.buffer,
    folder: 'anjali-diagnostic/hero-slides',
    resourceType: 'image',
    publicId: slideIdHint ? `hero-slide-${slideIdHint}-${Date.now()}` : undefined,
    overwrite: false,
    useFilename: false,
    uniqueFilename: true,
  });

  return {
    image: result?.secure_url || '',
    imagePublicId: result?.public_id || '',
  };
};

const toBoolean = (value, fallback = false) => {
  if (value === undefined || value === null || value === '') return fallback;
  if (typeof value === 'boolean') return value;
  return String(value).toLowerCase() === 'true';
};

const getHeroSlides = async (req, res) => {
  try {
    const query = {};
    if (req.query.isActive !== undefined) {
      query.isActive = req.query.isActive === 'true';
    }
    const slides = await HeroSlide.find(query).sort({ displayOrder: 1, createdAt: -1 });
    res.json(slides);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

const createHeroSlide = async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ message: 'Hero slide image is required' });
    }

    const imageData = await uploadHeroImage(req.file, req.body?.title || 'new');
    const slide = await HeroSlide.create({
      title: req.body?.title || '',
      displayOrder: Number(req.body?.displayOrder || 0),
      isActive: toBoolean(req.body?.isActive, true),
      image: imageData?.image || '',
      imagePublicId: imageData?.imagePublicId || '',
    });

    res.status(201).json(slide);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

const updateHeroSlide = async (req, res) => {
  try {
    const slide = await HeroSlide.findById(req.params.id);
    if (!slide) {
      return res.status(404).json({ message: 'Hero slide not found' });
    }

    const updates = {
      title: req.body?.title ?? slide.title,
      displayOrder: req.body?.displayOrder !== undefined ? Number(req.body.displayOrder) : slide.displayOrder,
      isActive: req.body?.isActive === undefined ? slide.isActive : toBoolean(req.body.isActive, slide.isActive),
    };

    if (req.file) {
      const imageData = await uploadHeroImage(req.file, slide._id.toString());
      updates.image = imageData?.image || slide.image;
      updates.imagePublicId = imageData?.imagePublicId || slide.imagePublicId;
    }

    const updatedSlide = await HeroSlide.findByIdAndUpdate(req.params.id, { $set: updates }, { new: true, runValidators: true });
    res.json(updatedSlide);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

const deleteHeroSlide = async (req, res) => {
  try {
    const slide = await HeroSlide.findById(req.params.id);
    if (!slide) {
      return res.status(404).json({ message: 'Hero slide not found' });
    }

    await HeroSlide.deleteOne({ _id: slide._id });
    res.json({ message: 'Hero slide deleted successfully' });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

const toggleHeroSlideStatus = async (req, res) => {
  try {
    const slide = await HeroSlide.findById(req.params.id);
    if (!slide) {
      return res.status(404).json({ message: 'Hero slide not found' });
    }

    slide.isActive = !slide.isActive;
    await slide.save();
    res.json(slide);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

module.exports = {
  getHeroSlides,
  createHeroSlide,
  updateHeroSlide,
  deleteHeroSlide,
  toggleHeroSlideStatus,
};
