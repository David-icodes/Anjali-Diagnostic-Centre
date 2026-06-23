const RadiologyService = require('../models/RadiologyService');
const ActivityLog = require('../models/ActivityLog');

const getRadiologyServices = async (req, res) => {
  try {
    const { isActive, search, page = 1, limit = 10 } = req.query;
    const query = {};
    if (isActive !== undefined) query.isActive = isActive === 'true';
    if (search) query.name = { $regex: search, $options: 'i' };

    const total = await RadiologyService.countDocuments(query);
    const services = await RadiologyService.find(query)
      .sort({ createdAt: -1 })
      .skip((page - 1) * limit)
      .limit(parseInt(limit));

    res.json({ services, total, page: parseInt(page), pages: Math.ceil(total / limit) });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

const getRadiologyServiceById = async (req, res) => {
  try {
    const service = await RadiologyService.findById(req.params.id);
    if (service) res.json(service);
    else res.status(404).json({ message: 'Radiology service not found' });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

const createRadiologyService = async (req, res) => {
  try {
    const service = await RadiologyService.create(req.body);
    await ActivityLog.create({
      user: req.user._id,
      username: req.user.name,
      action: 'Radiology Service Created',
      details: `Created radiology service: ${service.name}`,
      ipAddress: req.ip,
    });
    res.status(201).json(service);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

const updateRadiologyService = async (req, res) => {
  try {
    const service = await RadiologyService.findByIdAndUpdate(req.params.id, req.body, { new: true, runValidators: true });
    if (!service) return res.status(404).json({ message: 'Radiology service not found' });
    await ActivityLog.create({
      user: req.user._id,
      username: req.user.name,
      action: 'Radiology Service Updated',
      details: `Updated radiology service: ${service.name}`,
      ipAddress: req.ip,
    });
    res.json(service);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

const deleteRadiologyService = async (req, res) => {
  try {
    const service = await RadiologyService.findById(req.params.id);
    if (!service) return res.status(404).json({ message: 'Radiology service not found' });
    service.isActive = false;
    await service.save();
    await ActivityLog.create({
      user: req.user._id,
      username: req.user.name,
      action: 'Radiology Service Deactivated',
      details: `Deactivated radiology service: ${service.name}`,
      ipAddress: req.ip,
    });
    res.json({ message: 'Radiology service deactivated successfully', service });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

module.exports = { getRadiologyServices, getRadiologyServiceById, createRadiologyService, updateRadiologyService, deleteRadiologyService };
