const express = require('express');
const router = express.Router();
const User = require('../models/User');
const { body, validationResult } = require('express-validator');
const { redirectIfAuthenticated } = require('../middleware/auth');

// GET /login - Show login page
router.get('/login', redirectIfAuthenticated, (req, res) => {
  res.render('auth/login', {
    title: 'Login - Kadi\'s Admin',
    error: null,
    formData: {}
  });
});

// GET /register - Show register page
router.get('/register', redirectIfAuthenticated, (req, res) => {
  res.render('auth/register', {
    title: 'Register - Kadi\'s Admin',
    error: null,
    formData: {}
  });
});

// POST /login - Handle login
router.post('/login', [
  body('username')
    .trim()
    .notEmpty()
    .withMessage('Username is required'),
  body('password')
    .notEmpty()
    .withMessage('Password is required')
], async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.render('auth/login', {
        title: 'Login - Kadi\'s Admin',
        error: errors.array()[0].msg,
        formData: req.body
      });
    }

    const { username, password } = req.body;
    const user = await User.findOne({ username: username.toLowerCase() });

    if (!user || !(await user.comparePassword(password))) {
      return res.render('auth/login', {
        title: 'Login - Kadi\'s Admin',
        error: 'Invalid username or password',
        formData: req.body
      });
    }

    if (!user.isActive) {
      return res.render('auth/login', {
        title: 'Login - Kadi\'s Admin',
        error: 'Account is deactivated',
        formData: req.body
      });
    }

    // Update last login
    user.lastLogin = new Date();
    await user.save();

    // Set session
    req.session.userId = user._id;
    req.session.username = user.username;
    req.session.role = user.role;

    res.redirect('/admin');
  } catch (error) {
    console.error('Login error:', error);
    res.render('auth/login', {
      title: 'Login - Kadi\'s Admin',
      error: 'An error occurred during login',
      formData: req.body
    });
  }
});

// POST /register - Handle registration
router.post('/register', [
  body('username')
    .trim()
    .isLength({ min: 3, max: 50 })
    .withMessage('Username must be 3-50 characters')
    .matches(/^[a-zA-Z0-9_]+$/)
    .withMessage('Username can only contain letters, numbers, and underscores'),
  body('email')
    .isEmail()
    .normalizeEmail()
    .withMessage('Please enter a valid email'),
  body('password')
    .isLength({ min: 6 })
    .withMessage('Password must be at least 6 characters'),
  body('confirmPassword')
    .custom((value, { req }) => {
      if (value !== req.body.password) {
        throw new Error('Passwords do not match');
      }
      return true;
    })
], async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.render('auth/register', {
        title: 'Register - Kadi\'s Admin',
        error: errors.array()[0].msg,
        formData: req.body
      });
    }

    const { username, email, password } = req.body;

    // Check if user already exists
    const existingUser = await User.findOne({
      $or: [
        { username: username.toLowerCase() },
        { email: email.toLowerCase() }
      ]
    });

    if (existingUser) {
      const field = existingUser.username === username.toLowerCase() ? 'username' : 'email';
      return res.render('auth/register', {
        title: 'Register - Kadi\'s Admin',
        error: `A user with this ${field} already exists`,
        formData: req.body
      });
    }

    // Create new user
    const user = new User({
      username: username.toLowerCase(),
      email: email.toLowerCase(),
      password
    });

    await user.save();

    // Set session
    req.session.userId = user._id;
    req.session.username = user.username;
    req.session.role = user.role;

    res.redirect('/admin');
  } catch (error) {
    console.error('Registration error:', error);
    res.render('auth/register', {
      title: 'Register - Kadi\'s Admin',
      error: 'An error occurred during registration',
      formData: req.body
    });
  }
});

// POST /logout - Handle logout
router.post('/logout', (req, res) => {
  req.session.destroy((err) => {
    if (err) {
      console.error('Logout error:', err);
    }
    res.redirect('/login');
  });
});

module.exports = router;