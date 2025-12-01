const User = require('../models/User');

// Middleware to check if user is authenticated
const requireAuth = (req, res, next) => {
  if (req.session && req.session.userId) {
    return next();
  } else {
    return res.redirect('/login');
  }
};

// Middleware to check if user is admin
const requireAdmin = (req, res, next) => {
  if (req.session && req.session.userId && req.session.role === 'admin') {
    return next();
  } else {
    return res.status(403).render('error', {
      title: 'Access Denied',
      message: 'You do not have permission to access this page.',
      error: {}
    });
  }
};

// Middleware to redirect authenticated users away from auth pages
const redirectIfAuthenticated = (req, res, next) => {
  if (req.session && req.session.userId) {
    return res.redirect('/admin');
  }
  next();
};

module.exports = {
  requireAuth,
  requireAdmin,
  redirectIfAuthenticated
};