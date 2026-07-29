const ActivityLog = require('../models/ActivityLog');

const getActivityLogs = async (req, res) => {
  try {
    const page = Number(req.query.page || 1);
    const limit = Number(req.query.limit || 20);
    const includeArchived = req.query.includeArchived === 'true';
    const query = includeArchived ? {} : { isArchived: false };
    const total = await ActivityLog.countDocuments(query);
    const logs = await ActivityLog.find(query)
      .populate('user', 'name email')
      .sort({ createdAt: -1 })
      .skip((page - 1) * limit)
      .limit(limit);

    res.json({ logs, total, page, pages: Math.ceil(total / limit) || 1 });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

const deleteActivityLog = async (req, res) => {
  try {
    const log = await ActivityLog.findById(req.params.id);

    if (!log) {
      return res.status(404).json({ message: 'Activity log not found' });
    }

    log.isArchived = true;
    log.archivedAt = new Date();
    log.archivedBy = {
      userId: req.user?._id || null,
      username: req.user?.name || req.user?.username || 'System',
    };
    await log.save();
    res.json({ message: 'Activity log archived successfully' });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

const deleteSelectedActivityLogs = async (req, res) => {
  try {
    const ids = Array.isArray(req.body.ids) ? req.body.ids.filter(Boolean) : [];

    if (ids.length === 0) {
      return res.status(400).json({ message: 'No activity logs selected' });
    }

    const result = await ActivityLog.updateMany(
      { _id: { $in: ids } },
      {
        $set: {
          isArchived: true,
          archivedAt: new Date(),
          archivedBy: {
            userId: req.user?._id || null,
            username: req.user?.name || req.user?.username || 'System',
          },
        },
      }
    );
    res.json({ message: 'Selected activity logs archived successfully', updatedCount: result.modifiedCount || 0 });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

const clearAllActivityLogs = async (req, res) => {
  try {
    const result = await ActivityLog.updateMany(
      { isArchived: false },
      {
        $set: {
          isArchived: true,
          archivedAt: new Date(),
          archivedBy: {
            userId: req.user?._id || null,
            username: req.user?.name || req.user?.username || 'System',
          },
        },
      }
    );
    res.json({ message: 'All activity logs archived successfully', updatedCount: result.modifiedCount || 0 });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

const restoreActivityLog = async (req, res) => {
  try {
    const log = await ActivityLog.findById(req.params.id);

    if (!log) {
      return res.status(404).json({ message: 'Activity log not found' });
    }

    log.isArchived = false;
    log.archivedAt = null;
    log.archivedBy = { userId: null, username: '' };
    await log.save();

    res.json({ message: 'Activity log restored successfully' });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

module.exports = {
  getActivityLogs,
  deleteActivityLog,
  deleteSelectedActivityLogs,
  clearAllActivityLogs,
  restoreActivityLog,
};
