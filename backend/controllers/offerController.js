const Offer = require('../models/Offer');
const { uploadBufferToCloudinary } = require('../config/cloudinary');

const uploadOfferImage = async (file, offerIdHint) => {
  if (!file?.buffer) return null;

  const result = await uploadBufferToCloudinary({
    buffer: file.buffer,
    folder: 'anjali-diagnostic/offers',
    resourceType: 'image',
    publicId: offerIdHint ? `offer-${offerIdHint}-${Date.now()}` : undefined,
    overwrite: false,
    useFilename: false,
    uniqueFilename: true,
  });

  return {
    image: result?.secure_url || '',
    imagePublicId: result?.public_id || '',
  };
};

const getOffers = async (req, res) => {
  try {
    const { isActive } = req.query;
    const query = {};

    if (isActive !== undefined) query.isActive = isActive === 'true';

    const now = new Date();
    query.validUntil = { $gte: now };

    const offers = await Offer.find(query).sort({ createdAt: -1 });
    res.json(offers);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

const getOfferById = async (req, res) => {
  try {
    const offer = await Offer.findById(req.params.id);
    if (offer) {
      res.json(offer);
    } else {
      res.status(404).json({ message: 'Offer not found' });
    }
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

const createOffer = async (req, res) => {
  try {
    const offerData = { ...req.body };

    if (req.file) {
      const uploadResult = await uploadOfferImage(req.file, req.body?.title || 'new');
      offerData.image = uploadResult?.image || '';
      offerData.imagePublicId = uploadResult?.imagePublicId || '';
    }

    const offer = await Offer.create(offerData);
    res.status(201).json(offer);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

const updateOffer = async (req, res) => {
  try {
    const offer = await Offer.findById(req.params.id);

    if (!offer) {
      return res.status(404).json({ message: 'Offer not found' });
    }

    const offerData = { ...req.body };

    if (req.file) {
      const uploadResult = await uploadOfferImage(req.file, offer._id.toString());
      offerData.image = uploadResult?.image || '';
      offerData.imagePublicId = uploadResult?.imagePublicId || '';
    }

    const updatedOffer = await Offer.findByIdAndUpdate(
      req.params.id,
      { $set: offerData },
      { new: true, runValidators: true }
    );

    res.json(updatedOffer);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

const deleteOffer = async (req, res) => {
  try {
    const offer = await Offer.findById(req.params.id);

    if (!offer) {
      return res.status(404).json({ message: 'Offer not found' });
    }

    offer.isActive = false;
    await offer.save();
    res.json({ message: 'Offer deactivated successfully' });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

const toggleOfferStatus = async (req, res) => {
  try {
    const offer = await Offer.findById(req.params.id);

    if (!offer) {
      return res.status(404).json({ message: 'Offer not found' });
    }

    offer.isActive = !offer.isActive;
    const updatedOffer = await offer.save();
    res.json(updatedOffer);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

module.exports = {
  getOffers,
  getOfferById,
  createOffer,
  updateOffer,
  deleteOffer,
  toggleOfferStatus,
};
