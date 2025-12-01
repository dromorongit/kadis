const express = require('express');
const router = express.Router();
const { requireAuth, requireAdmin } = require('../middleware/auth');
const Product = require('../models/Product');
const User = require('../models/User');
const { body, validationResult } = require('express-validator');

// Apply authentication middleware to all admin routes
router.use(requireAuth);
router.use(requireAdmin);

// GET /admin - Dashboard
router.get('/', async (req, res) => {
  try {
    const totalProducts = await Product.countDocuments({ isActive: true });
    const featuredProducts = await Product.countDocuments({ featured: true, isActive: true });
    const menProducts = await Product.countDocuments({ category: 'Men', isActive: true });
    const womenProducts = await Product.countDocuments({ category: 'Women', isActive: true });
    const outOfStock = await Product.countDocuments({ stockQuantity: 0, isActive: true });

    const recentProducts = await Product.find({ isActive: true })
      .sort({ createdAt: -1 })
      .limit(5)
      .select('title category price createdAt');

    res.render('admin/dashboard', {
      title: 'Dashboard - Kadi\'s Admin',
      user: req.session,
      stats: {
        totalProducts,
        featuredProducts,
        menProducts,
        womenProducts,
        outOfStock
      },
      recentProducts
    });
  } catch (error) {
    console.error('Dashboard error:', error);
    res.status(500).render('error', {
      title: 'Server Error',
      message: 'Failed to load dashboard',
      error: process.env.NODE_ENV === 'development' ? error : {}
    });
  }
});

// GET /admin/profile - User profile
router.get('/profile', (req, res) => {
  res.render('admin/profile', {
    title: 'Profile - Kadi\'s Admin',
    user: req.session
  });
});

// POST /admin/profile - Update user profile
router.post('/profile', [
  body('username').trim().isLength({ min: 3, max: 50 }).withMessage('Username must be 3-50 characters'),
  body('email').isEmail().normalizeEmail().withMessage('Please enter a valid email'),
  body('newPassword').optional().isLength({ min: 6 }).withMessage('New password must be at least 6 characters')
], async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ message: errors.array()[0].msg });
    }

    const user = await User.findById(req.session.userId);
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    // Check current password if changing password
    if (req.body.newPassword) {
      if (!req.body.currentPassword) {
        return res.status(400).json({ message: 'Current password is required to change password' });
      }

      const isValidPassword = await user.comparePassword(req.body.currentPassword);
      if (!isValidPassword) {
        return res.status(400).json({ message: 'Current password is incorrect' });
      }

      user.password = req.body.newPassword;
    }

    // Check if username is taken by another user
    if (req.body.username !== user.username) {
      const existingUser = await User.findOne({ username: req.body.username, _id: { $ne: user._id } });
      if (existingUser) {
        return res.status(400).json({ message: 'Username is already taken' });
      }
      user.username = req.body.username;
    }

    // Check if email is taken by another user
    if (req.body.email !== user.email) {
      const existingUser = await User.findOne({ email: req.body.email, _id: { $ne: user._id } });
      if (existingUser) {
        return res.status(400).json({ message: 'Email is already taken' });
      }
      user.email = req.body.email;
    }

    await user.save();

    // Update session
    req.session.username = user.username;
    req.session.email = user.email;

    res.json({ message: 'Profile updated successfully' });
  } catch (error) {
    console.error('Profile update error:', error);
    res.status(500).json({ message: 'Failed to update profile' });
  }
});

// DELETE /admin/profile - Delete user account
router.delete('/profile', async (req, res) => {
  try {
    if (!req.body.password) {
      return res.status(400).json({ message: 'Password is required' });
    }

    const user = await User.findById(req.session.userId);
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    // Verify password
    const isValidPassword = await user.comparePassword(req.body.password);
    if (!isValidPassword) {
      return res.status(400).json({ message: 'Incorrect password' });
    }

    // Soft delete by setting isActive to false
    user.isActive = false;
    await user.save();

    // Destroy session
    req.session.destroy((err) => {
      if (err) {
        console.error('Session destroy error:', err);
      }
      res.json({ message: 'Account deleted successfully' });
    });
  } catch (error) {
    console.error('Profile delete error:', error);
    res.status(500).json({ message: 'Failed to delete account' });
  }
});

module.exports = router;