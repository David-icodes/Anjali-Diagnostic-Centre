const User = require('../models/User');
const ActivityLog = require('../models/ActivityLog');
const generateToken = require('../utils/generateToken');

const loginAdmin = async (req, res) => {
  try {
    const { username, password } = req.body;

    let user = await User.findOne({ username: username?.toLowerCase() });
    if (!user) user = await User.findOne({ email: username?.toLowerCase() });

    if (user && (await user.matchPassword(password))) {
      if (!user.isActive) {
        return res.status(401).json({ message: 'Account is deactivated. Contact super admin.' });
      }

      await ActivityLog.create({
        user: user._id,
        username: user.name,
        action: 'Login',
        details: 'User logged in',
        ipAddress: req.ip,
      });

      res.json({
        _id: user._id,
        name: user.name,
        username: user.username,
        email: user.email,
        role: user.role,
        avatar: user.avatar,
        token: generateToken(user._id),
      });
    } else {
      res.status(401).json({ message: 'Invalid credentials' });
    }
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

const getProfile = async (req, res) => {
  try {
    const user = await User.findById(req.user._id).select('-password');
    if (user) {
      res.json(user);
    } else {
      res.status(404).json({ message: 'User not found' });
    }
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

const updateProfile = async (req, res) => {
  try {
    const user = await User.findById(req.user._id);

    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    if (req.body.username && req.body.username !== user.username) {
      const existing = await User.findOne({ username: req.body.username.toLowerCase() });
      if (existing) return res.status(400).json({ message: 'Username already taken' });
    }

    user.name = req.body.name || user.name;
    user.username = req.body.username || user.username;
    user.email = req.body.email || user.email;
    user.avatar = req.body.avatar || user.avatar;

    if (req.body.password) {
      user.password = req.body.password;
    }

    const updatedUser = await user.save();

    await ActivityLog.create({
      user: req.user._id,
      username: req.user.name,
      action: 'Profile Updated',
      details: 'User updated own profile',
      ipAddress: req.ip,
    });

    res.json({
      _id: updatedUser._id,
      name: updatedUser.name,
      username: updatedUser.username,
      email: updatedUser.email,
      role: updatedUser.role,
      avatar: updatedUser.avatar,
      token: generateToken(updatedUser._id),
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

const createStaff = async (req, res) => {
  try {
    const { name, email, password, mobileNumber, role } = req.body;

    const userExists = await User.findOne({ email });

    if (userExists) {
      return res.status(400).json({ message: 'User already exists with this email' });
    }

    const userRole = role || 'staff';

    if (userRole === 'superadmin' && req.user.role !== 'superadmin') {
      return res.status(403).json({ message: 'Only super admin can create super admin accounts' });
    }

    const user = await User.create({
      name,
      email,
      password,
      mobileNumber,
      role: userRole,
      deactivatedAt: null,
    });

    await ActivityLog.create({
      user: req.user._id,
      username: req.user.name,
      action: 'User Created',
      details: `Created user: ${user.name} (${user.role})`,
      ipAddress: req.ip,
    });

    res.status(201).json({
      _id: user._id,
      name: user.name,
      email: user.email,
      role: user.role,
      mobileNumber: user.mobileNumber,
      isActive: user.isActive,
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

const getUsers = async (req, res) => {
  try {
    const users = await User.find({}).select('-password').sort({ createdAt: -1 });
    res.json(users);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

const updateUser = async (req, res) => {
  try {
    const user = await User.findById(req.params.id);

    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    if (user.isDefault && req.user.role !== 'superadmin') {
      return res.status(403).json({ message: 'Default super admin can only be edited by super admin' });
    }

    if (user.isDefault && req.body.isActive === false) {
      return res.status(400).json({ message: 'Default super admin cannot be disabled' });
    }

    if (req.body.username && req.body.username !== user.username) {
      const existing = await User.findOne({ username: req.body.username.toLowerCase() });
      if (existing) return res.status(400).json({ message: 'Username already taken' });
    }

    user.name = req.body.name || user.name;
    user.username = req.body.username || user.username;
    user.email = req.body.email || user.email;
    user.mobileNumber = req.body.mobileNumber !== undefined ? req.body.mobileNumber : user.mobileNumber;
    user.role = req.body.role || user.role;
    if (req.body.isActive !== undefined) {
      user.isActive = req.body.isActive;
      user.deactivatedAt = req.body.isActive ? null : new Date();
    }

    if (req.body.password) {
      user.password = req.body.password;
    }

    const updatedUser = await user.save();

    await ActivityLog.create({
      user: req.user._id,
      username: req.user.name,
      action: 'User Updated',
      details: `Updated user: ${updatedUser.name}`,
      ipAddress: req.ip,
    });

    res.json({
      _id: updatedUser._id,
      name: updatedUser.name,
      username: updatedUser.username,
      email: updatedUser.email,
      role: updatedUser.role,
      mobileNumber: updatedUser.mobileNumber,
      isActive: updatedUser.isActive,
      isDefault: updatedUser.isDefault,
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

const deleteUser = async (req, res) => {
  try {
    const user = await User.findById(req.params.id);

    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    if (user.isDefault) {
      return res.status(400).json({ message: 'Default super admin cannot be deleted' });
    }

    if (user.role === 'superadmin' && req.user.role !== 'superadmin') {
      return res.status(403).json({ message: 'Only super admin can delete super admin accounts' });
    }

    user.isActive = false;
    user.deactivatedAt = new Date();
    await user.save();

    await ActivityLog.create({
      user: req.user._id,
      username: req.user.name,
      action: 'User Deactivated',
      details: `Deactivated user: ${user.name}`,
      ipAddress: req.ip,
    });

    res.json({ message: 'User deactivated successfully' });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

module.exports = {
  loginAdmin,
  getProfile,
  updateProfile,
  createStaff,
  getUsers,
  updateUser,
  deleteUser,
};
