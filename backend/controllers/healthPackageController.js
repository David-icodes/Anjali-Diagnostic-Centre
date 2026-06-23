const HealthPackage = require('../models/HealthPackage');
const ActivityLog = require('../models/ActivityLog');

const getHealthPackages = async (req, res) => {
  try {
    const { isActive, search, page = 1, limit = 10 } = req.query;
    const query = {};
    if (isActive !== undefined) query.isActive = isActive === 'true';
    if (search) query.name = { $regex: search, $options: 'i' };

    const total = await HealthPackage.countDocuments(query);
    const packages = await HealthPackage.find(query)
      .sort({ createdAt: -1 })
      .skip((page - 1) * limit)
      .limit(parseInt(limit));

    res.json({ packages, total, page: parseInt(page), pages: Math.ceil(total / limit) });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

const getHealthPackageById = async (req, res) => {
  try {
    const pkg = await HealthPackage.findById(req.params.id);
    if (pkg) res.json(pkg);
    else res.status(404).json({ message: 'Health package not found' });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

const createHealthPackage = async (req, res) => {
  try {
    const pkg = await HealthPackage.create(req.body);
    await ActivityLog.create({
      user: req.user._id,
      username: req.user.name,
      action: 'Health Package Created',
      details: `Created health package: ${pkg.name}`,
      ipAddress: req.ip,
    });
    res.status(201).json(pkg);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

const updateHealthPackage = async (req, res) => {
  try {
    const pkg = await HealthPackage.findByIdAndUpdate(req.params.id, req.body, { new: true, runValidators: true });
    if (!pkg) return res.status(404).json({ message: 'Health package not found' });
    await ActivityLog.create({
      user: req.user._id,
      username: req.user.name,
      action: 'Health Package Updated',
      details: `Updated health package: ${pkg.name}`,
      ipAddress: req.ip,
    });
    res.json(pkg);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

const deleteHealthPackage = async (req, res) => {
  try {
    const pkg = await HealthPackage.findById(req.params.id);
    if (!pkg) return res.status(404).json({ message: 'Health package not found' });
    pkg.isActive = false;
    await pkg.save();
    await ActivityLog.create({
      user: req.user._id,
      username: req.user.name,
      action: 'Health Package Deactivated',
      details: `Deactivated health package: ${pkg.name}`,
      ipAddress: req.ip,
    });
    res.json({ message: 'Health package deactivated successfully', package: pkg });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

module.exports = { getHealthPackages, getHealthPackageById, createHealthPackage, updateHealthPackage, deleteHealthPackage };
