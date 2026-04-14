const { validationResult } = require('express-validator');
const User = require('../models/User');

// @desc    Get all users with pagination, search, filter
// @route   GET /api/users
// @access  Admin, Manager
exports.getUsers = async (req, res, next) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 10;
    const skip = (page - 1) * limit;

    const filter = {};

    if (req.query.search) {
      filter.$or = [
        { name: { $regex: req.query.search, $options: 'i' } },
        { email: { $regex: req.query.search, $options: 'i' } },
      ];
    }

    if (req.query.role) filter.role = req.query.role;
    if (req.query.status) filter.status = req.query.status;

    // Manager cannot see admin users
    if (req.user.role === 'manager') {
      filter.role = { $ne: 'admin' };
    }

    const [users, total] = await Promise.all([
      User.find(filter)
        .populate('createdBy', 'name email')
        .populate('updatedBy', 'name email')
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(limit),
      User.countDocuments(filter),
    ]);

    res.json({
      success: true,
      data: users,
      pagination: {
        page,
        limit,
        total,
        pages: Math.ceil(total / limit),
      },
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Get single user
// @route   GET /api/users/:id
// @access  Admin, Manager (own profile for User)
exports.getUser = async (req, res, next) => {
  try {
    // Regular user can only view own profile
    if (req.user.role === 'user' && req.params.id !== req.user._id.toString()) {
      return res.status(403).json({ success: false, message: 'Access denied' });
    }

    const user = await User.findById(req.params.id)
      .populate('createdBy', 'name email')
      .populate('updatedBy', 'name email');

    if (!user) {
      return res.status(404).json({ success: false, message: 'User not found' });
    }

    // Manager cannot view admin users
    if (req.user.role === 'manager' && user.role === 'admin') {
      return res.status(403).json({ success: false, message: 'Access denied' });
    }

    res.json({ success: true, data: user });
  } catch (error) {
    next(error);
  }
};

// @desc    Create new user
// @route   POST /api/users
// @access  Admin only
exports.createUser = async (req, res, next) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ success: false, errors: errors.array() });
    }

    const { name, email, password, role, status } = req.body;

    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return res.status(400).json({ success: false, message: 'Email already exists' });
    }

    const user = await User.create({
      name,
      email,
      password,
      role: role || 'user',
      status: status || 'active',
      createdBy: req.user._id,
      updatedBy: req.user._id,
    });

    res.status(201).json({ success: true, data: user });
  } catch (error) {
    next(error);
  }
};

// @desc    Update user
// @route   PUT /api/users/:id
// @access  Admin (all fields), Manager (non-admin users), User (own profile - limited)
exports.updateUser = async (req, res, next) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ success: false, errors: errors.array() });
    }

    const user = await User.findById(req.params.id);
    if (!user) {
      return res.status(404).json({ success: false, message: 'User not found' });
    }

    const { role: requestorRole, _id: requestorId } = req.user;

    // User can only update their own profile
    if (requestorRole === 'user') {
      if (req.params.id !== requestorId.toString()) {
        return res.status(403).json({ success: false, message: 'Access denied' });
      }
      // User cannot change their own role or status
      delete req.body.role;
      delete req.body.status;
    }

    // Manager cannot update admin users or change roles to admin
    if (requestorRole === 'manager') {
      if (user.role === 'admin') {
        return res.status(403).json({ success: false, message: 'Cannot modify admin users' });
      }
      if (req.body.role === 'admin') {
        return res.status(403).json({ success: false, message: 'Cannot assign admin role' });
      }
    }

    const allowedFields = ['name', 'email', 'role', 'status'];
    if (requestorRole === 'admin' || requestorRole === 'manager') {
      allowedFields.push('role', 'status');
    }

    const updates = {};
    Object.keys(req.body).forEach((key) => {
      if (allowedFields.includes(key)) updates[key] = req.body[key];
    });

    // Handle password update
    if (req.body.password) {
      user.password = req.body.password;
      await user.save();
    }

    updates.updatedBy = requestorId;
    const updatedUser = await User.findByIdAndUpdate(req.params.id, updates, {
      new: true,
      runValidators: true,
    })
      .populate('createdBy', 'name email')
      .populate('updatedBy', 'name email');

    res.json({ success: true, data: updatedUser });
  } catch (error) {
    next(error);
  }
};

// @desc    Soft delete (deactivate) user
// @route   DELETE /api/users/:id
// @access  Admin only
exports.deleteUser = async (req, res, next) => {
  try {
    const user = await User.findById(req.params.id);
    if (!user) {
      return res.status(404).json({ success: false, message: 'User not found' });
    }

    // Cannot delete self
    if (req.params.id === req.user._id.toString()) {
      return res.status(400).json({ success: false, message: 'Cannot delete your own account' });
    }

    await User.findByIdAndUpdate(req.params.id, {
      status: 'inactive',
      updatedBy: req.user._id,
    });

    res.json({ success: true, message: 'User deactivated successfully' });
  } catch (error) {
    next(error);
  }
};

// @desc    Get dashboard stats
// @route   GET /api/users/stats
// @access  Admin only
exports.getStats = async (req, res, next) => {
  try {
    const [total, active, inactive, admins, managers, users] = await Promise.all([
      User.countDocuments(),
      User.countDocuments({ status: 'active' }),
      User.countDocuments({ status: 'inactive' }),
      User.countDocuments({ role: 'admin' }),
      User.countDocuments({ role: 'manager' }),
      User.countDocuments({ role: 'user' }),
    ]);

    res.json({
      success: true,
      data: { total, active, inactive, admins, managers, users },
    });
  } catch (error) {
    next(error);
  }
};
