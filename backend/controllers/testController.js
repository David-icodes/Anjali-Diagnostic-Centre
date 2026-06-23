const Test = require('../models/Test');

const getTests = async (req, res) => {
  try {
    const { category, search, isActive, page = 1, limit = 12 } = req.query;
    const query = {};

    if (category) query.category = category;
    if (isActive !== undefined) query.isActive = isActive === 'true';
    if (req.query.popular !== undefined) query.isPopular = req.query.popular === 'true';
    if (search) {
      query.name = { $regex: search, $options: 'i' };
    }

    const total = await Test.countDocuments(query);
    const tests = await Test.find(query)
      .sort({ createdAt: -1 })
      .skip((page - 1) * limit)
      .limit(parseInt(limit));

    res.json({
      tests,
      total,
      page: parseInt(page),
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
    const test = await Test.create(req.body);
    res.status(201).json(test);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

const updateTest = async (req, res) => {
  try {
    const updatedTest = await Test.findByIdAndUpdate(
      req.params.id,
      req.body,
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
    await test.save();
    res.json({ message: 'Test deactivated successfully', test });
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
    const tests = await Test.find({ isActive: true, isPopular: true }).limit(8);
    res.json(tests);
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
};
