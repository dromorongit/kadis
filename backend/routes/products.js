const express = require('express');
const router = express.Router();
const { requireAuth, requireAdmin } = require('../middleware/auth');
const Product = require('../models/Product');
const { body, validationResult } = require('express-validator');
const multer = require('multer');
const path = require('path');
const fs = require('fs');

// Ensure uploads directory exists
const uploadsDir = path.join(__dirname, '../public/uploads');
if (!fs.existsSync(uploadsDir)) {
  fs.mkdirSync(uploadsDir, { recursive: true });
}

// Multer configuration for image uploads
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, uploadsDir);
  },
  filename: (req, file, cb) => {
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
    cb(null, file.fieldname + '-' + uniqueSuffix + path.extname(file.originalname));
  }
});

const upload = multer({
  storage: storage,
  limits: { fileSize: 5 * 1024 * 1024 }, // 5MB limit
  fileFilter: (req, file, cb) => {
    if (file.mimetype.startsWith('image/')) {
      cb(null, true);
    } else {
      cb(new Error('Only image files are allowed'), false);
    }
  }
});

// Apply authentication middleware
router.use(requireAuth);
router.use(requireAdmin);

// GET /products - List all products
router.get('/', async (req, res) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 20;
    const skip = (page - 1) * limit;

    const filter = { isActive: true };
    if (req.query.category) filter.category = req.query.category;
    if (req.query.search) {
      filter.$text = { $search: req.query.search };
    }

    const products = await Product.find(filter)
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit);

    const total = await Product.countDocuments(filter);

    res.render('admin/products/index', {
      title: 'Products - Kadi\'s Admin',
      user: req.session,
      products,
      currentPage: page,
      totalPages: Math.ceil(total / limit),
      totalProducts: total,
      query: req.query
    });
  } catch (error) {
    console.error('Products list error:', error);
    res.status(500).render('error', {
      title: 'Server Error',
      message: 'Failed to load products',
      error: process.env.NODE_ENV === 'development' ? error : {}
    });
  }
});

// GET /products/new - Show create product form
router.get('/new', (req, res) => {
  res.render('admin/products/new', {
    title: 'Add Product - Kadi\'s Admin',
    user: req.session,
    product: {},
    errors: null
  });
});

// POST /products - Create new product
router.post('/', upload.array('images', 10), [
  body('id').trim().notEmpty().withMessage('Product ID is required'),
  body('title').trim().notEmpty().withMessage('Title is required'),
  body('shortDescription').trim().notEmpty().withMessage('Short description is required'),
  body('price').isFloat({ min: 0 }).withMessage('Price must be a positive number'),
  body('category').isIn(['Men', 'Women']).withMessage('Category must be Men or Women')
], async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.render('admin/products/new', {
        title: 'Add Product - Kadi\'s Admin',
        user: req.session,
        product: req.body,
        errors: errors.array()
      });
    }

    // Check if product ID already exists
    const existingProduct = await Product.findOne({ id: req.body.id });
    if (existingProduct) {
      return res.render('admin/products/new', {
        title: 'Add Product - Kadi\'s Admin',
        user: req.session,
        product: req.body,
        errors: [{ msg: 'Product ID already exists' }]
      });
    }

    const productData = {
      ...req.body,
      sizes: req.body.sizes ? req.body.sizes.split(',').map(s => s.trim()) : [],
      tags: req.body.tags ? req.body.tags.split(',').map(t => t.trim().toLowerCase()) : [],
      images: req.files ? req.files.map(file => '/uploads/' + file.filename) : [],
      promoPrice: req.body.promoPrice || null,
      oldPrice: req.body.oldPrice || null,
      isPromoActive: req.body.isPromoActive === 'on',
      featured: req.body.featured === 'on',
      inStock: req.body.inStock !== 'false',
      stockQuantity: parseInt(req.body.stockQuantity) || 0
    };

    const product = new Product(productData);
    await product.save();

    console.log('Product created:', { id: product.id, title: product.title, category: product.category });

    req.session.success = 'Product created successfully';
    res.redirect('/products');
  } catch (error) {
    console.error('Create product error:', error);
    res.render('admin/products/new', {
      title: 'Add Product - Kadi\'s Admin',
      user: req.session,
      product: req.body,
      errors: [{ msg: 'Failed to create product' }]
    });
  }
});

// GET /products/:id/edit - Show edit product form
router.get('/:id/edit', async (req, res) => {
  try {
    const product = await Product.findOne({ id: req.params.id });
    if (!product) {
      return res.status(404).render('error', {
        title: 'Not Found',
        message: 'Product not found',
        error: {}
      });
    }

    res.render('admin/products/edit', {
      title: 'Edit Product - Kadi\'s Admin',
      user: req.session,
      product,
      errors: null
    });
  } catch (error) {
    console.error('Edit product error:', error);
    res.status(500).render('error', {
      title: 'Server Error',
      message: 'Failed to load product',
      error: process.env.NODE_ENV === 'development' ? error : {}
    });
  }
});

// PUT /products/:id - Update product
router.put('/:id', upload.array('images', 10), [
  body('title').trim().notEmpty().withMessage('Title is required'),
  body('shortDescription').trim().notEmpty().withMessage('Short description is required'),
  body('price').isFloat({ min: 0 }).withMessage('Price must be a positive number'),
  body('category').isIn(['Men', 'Women']).withMessage('Category must be Men or Women')
], async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      const product = await Product.findOne({ id: req.params.id });
      return res.render('admin/products/edit', {
        title: 'Edit Product - Kadi\'s Admin',
        user: req.session,
        product: { ...product.toObject(), ...req.body },
        errors: errors.array()
      });
    }

    const productData = {
      ...req.body,
      sizes: req.body.sizes ? req.body.sizes.split(',').map(s => s.trim()) : [],
      tags: req.body.tags ? req.body.tags.split(',').map(t => t.trim().toLowerCase()) : [],
      images: req.files && req.files.length > 0 ? req.files.map(file => '/uploads/' + file.filename) : product.images,
      promoPrice: req.body.promoPrice || null,
      oldPrice: req.body.oldPrice || null,
      isPromoActive: req.body.isPromoActive === 'on',
      featured: req.body.featured === 'on',
      inStock: req.body.inStock !== 'false',
      stockQuantity: parseInt(req.body.stockQuantity) || 0
    };

    await Product.findOneAndUpdate(
      { id: req.params.id },
      productData,
      { new: true, runValidators: true }
    );

    req.session.success = 'Product updated successfully';
    res.redirect('/products');
  } catch (error) {
    console.error('Update product error:', error);
    const product = await Product.findOne({ id: req.params.id });
    res.render('admin/products/edit', {
      title: 'Edit Product - Kadi\'s Admin',
      user: req.session,
      product: { ...product.toObject(), ...req.body },
      errors: [{ msg: 'Failed to update product' }]
    });
  }
});

// DELETE /products/:id - Delete product (soft delete)
router.delete('/:id', async (req, res) => {
  try {
    await Product.findOneAndUpdate(
      { id: req.params.id },
      { isActive: false },
      { new: true }
    );

    req.session.success = 'Product deleted successfully';
    res.redirect('/products');
  } catch (error) {
    console.error('Delete product error:', error);
    req.session.error = 'Failed to delete product';
    res.redirect('/products');
  }
});

module.exports = router;