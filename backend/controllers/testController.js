const Test = require('../models/Test');

const normalizeOfferState = (payload = {}) => {
  const originalPrice = Number(payload.originalPrice || 0);
  const requestedOfferPrice = payload.offerPrice !== undefined && payload.offerPrice !== ''
    ? Number(payload.offerPrice)
    : 0;

  const inferredOffer = requestedOfferPrice > 0 && requestedOfferPrice < originalPrice;
  const hasOffer = payload.hasOffer !== undefined
    ? String(payload.hasOffer) === 'true' || payload.hasOffer === true
    : inferredOffer;

  const offerText = String(payload.offerText || payload.offerBadge || payload.offerLabel || '').trim();

  return {
    ...payload,
    category: payload.category || 'Other',
    originalPrice,
    offerPrice: hasOffer ? requestedOfferPrice : 0,
    hasOffer,
    offerText,
    offerLabel: hasOffer ? offerText : '',
    offerBadge: hasOffer ? offerText : '',
  };
};

const getTests = async (req, res) => {
  try {
    const { category, search, isActive, includeDeleted, page = 1, limit = 12 } = req.query;
    const query = includeDeleted === 'true' ? {} : { isDeleted: { $ne: true } };

    if (category) query.category = category;
    if (isActive !== undefined) query.isActive = isActive === 'true';
    if (req.query.popular !== undefined) query.isPopular = req.query.popular === 'true';
    if (req.query.hasOffer !== undefined) {
      if (req.query.hasOffer === 'true') {
        query.$or = [
          { hasOffer: true },
          { $expr: { $lt: ['$offerPrice', '$originalPrice'] } },
        ];
      } else {
        query.hasOffer = false;
      }
    }
    if (search) {
      query.name = { $regex: search, $options: 'i' };
    }

    const total = await Test.countDocuments(query);
    const tests = await Test.find(query)
      .sort({ createdAt: -1 })
      .skip((page - 1) * limit)
      .limit(parseInt(limit, 10));

    res.json({
      tests,
      total,
      page: parseInt(page, 10),
      pages: Math.ceil(total / limit),
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

const getTestById = async (req, res) => {
  try {
    const test = await Test.findById(req.params.id);
    if (test) {
      res.json(test);
    } else {
      res.status(404).json({ message: 'Test not found' });
    }
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

const createTest = async (req, res) => {
  try {
    const payload = normalizeOfferState({
      ...req.body,
      description: req.body.description || '',
    });

    const test = await Test.create(payload);
    res.status(201).json(test);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

const updateTest = async (req, res) => {
  try {
    const payload = normalizeOfferState({
      ...req.body,
      description: req.body.description ?? '',
    });

    const updatedTest = await Test.findByIdAndUpdate(
      req.params.id,
      payload,
      { new: true, runValidators: true }
    );

    if (!updatedTest) {
      return res.status(404).json({ message: 'Test not found' });
    }

    res.json(updatedTest);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

const deleteTest = async (req, res) => {
  try {
    const test = await Test.findById(req.params.id);

    if (!test) {
      return res.status(404).json({ message: 'Test not found' });
    }

    test.isActive = false;
    test.isDeleted = true;
    test.deletedAt = new Date();
    test.deletedBy = {
      userId: req.user?._id || null,
      username: req.user?.name || req.user?.username || '',
    };
    await test.save();
    res.json({ message: 'Test deleted successfully', test });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

const toggleTestStatus = async (req, res) => {
  try {
    const test = await Test.findById(req.params.id);

    if (!test) {
      return res.status(404).json({ message: 'Test not found' });
    }

    if (test.isDeleted) {
      return res.status(400).json({ message: 'Deleted tests cannot be activated. Restore the test first.' });
    }

    test.isActive = !test.isActive;
    const updatedTest = await test.save();
    res.json(updatedTest);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

const getCategories = async (req, res) => {
  try {
    const categories = await Test.distinct('category');
    res.json(categories);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

const getPopularTests = async (req, res) => {
  try {
    const tests = await Test.find({
      isActive: true,
      isPopular: true,
      isDeleted: { $ne: true },
    })
      .sort({ createdAt: -1 })
      .limit(8);

    res.json({ tests });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

const restoreTest = async (req, res) => {
  try {
    const test = await Test.findById(req.params.id);

    if (!test) {
      return res.status(404).json({ message: 'Test not found' });
    }

    test.isDeleted = false;
    test.deletedAt = null;
    test.deletedBy = { userId: null, username: '' };
    await test.save();

    res.json(test);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

module.exports = {
  getTests,
  getTestById,
  createTest,
  updateTest,
  deleteTest,
  toggleTestStatus,
  getCategories,
  getPopularTests,
  restoreTest,
};
