const express = require('express');
const router = express.Router();
const { requireAuth, requireAdmin } = require('../middleware/auth');
const Product = require('../models/Product');
const { body, validationResult } = require('express-validator');
const cloudinary = require('../config/cloudinary');

// Helper function to upload image to Cloudinary
async function uploadToCloudinary(base64Data, publicId) {
  try {
    const result = await cloudinary.uploader.upload(base64Data, {
      folder: 'kadis-products',
      public_id: publicId,
      resource_type: 'image',
      transformation: [
        { quality: 'auto:best' },
        { fetch_format: 'auto' }
      ]
    });
    return result.secure_url;
  } catch (error) {
    console.error('Cloudinary upload error:', error);
    throw error;
  }
}

// Helper function to delete image from Cloudinary
async function deleteFromCloudinary(imageUrl) {
  try {
    // Extract public_id from URL
    const matches = imageUrl.match(/\/v\d+\/([^\/]+)\./);
    if (matches) {
      const publicId = `kadis-products/${matches[1]}`;
      await cloudinary.uploader.destroy(publicId);
    }
  } catch (error) {
    console.error('Cloudinary delete error:', error);
  }
}

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
router.post('/', [
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

    // Handle image uploads from Cloudinary widget (base64 data URLs)
    let images = [];
    if (req.body.imageUrls && Array.isArray(req.body.imageUrls)) {
      // Use image URLs from Cloudinary widget
      images = req.body.imageUrls.filter(url => url.trim() && url.startsWith('https://'));
    } else if (req.body.imageData && Array.isArray(req.body.imageData)) {
      // Upload base64 images to Cloudinary
      for (const base64Data of req.body.imageData) {
        if (base64Data && base64Data.startsWith('data:')) {
          try {
            const publicId = `product-${req.body.id}-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
            const imageUrl = await uploadToCloudinary(base64Data, publicId);
            images.push(imageUrl);
          } catch (error) {
            console.error('Error uploading image:', error);
          }
        }
      }
    }

    const productData = {
      ...req.body,
      sizes: req.body.sizes ? req.body.sizes.split(',').map(s => s.trim()) : [],
      tags: req.body.tags ? req.body.tags.split(',').map(t => t.trim().toLowerCase()) : [],
      images: images,
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
router.put('/:id', [
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

    // Get current product to access old images
    const currentProduct = await Product.findOne({ id: req.params.id });
    if (!currentProduct) {
      return res.status(404).render('error', {
        title: 'Not Found',
        message: 'Product not found',
        error: {}
      });
    }

    // Handle image updates
    let images = currentProduct.images;
    
    // Check if new images are being uploaded from Cloudinary widget
    if (req.body.imageUrls && Array.isArray(req.body.imageUrls)) {
      // Delete old images from Cloudinary
      if (currentProduct.images && currentProduct.images.length > 0) {
        for (const imageUrl of currentProduct.images) {
          await deleteFromCloudinary(imageUrl);
        }
      }
      // Use new image URLs from Cloudinary widget
      images = req.body.imageUrls.filter(url => url.trim() && url.startsWith('https://'));
    } else if (req.body.imageData && Array.isArray(req.body.imageData)) {
      // Upload new base64 images to Cloudinary
      const newImages = [];
      for (const base64Data of req.body.imageData) {
        if (base64Data && base64Data.startsWith('data:')) {
          try {
            const publicId = `product-${req.params.id}-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
            const imageUrl = await uploadToCloudinary(base64Data, publicId);
            newImages.push(imageUrl);
          } catch (error) {
            console.error('Error uploading image:', error);
          }
        }
      }
      
      // Only replace if new images were uploaded successfully
      if (newImages.length > 0) {
        // Delete old images from Cloudinary
        if (currentProduct.images && currentProduct.images.length > 0) {
          for (const imageUrl of currentProduct.images) {
            await deleteFromCloudinary(imageUrl);
          }
        }
        images = newImages;
      }
    }

    const productData = {
      ...req.body,
      sizes: req.body.sizes ? req.body.sizes.split(',').map(s => s.trim()) : [],
      tags: req.body.tags ? req.body.tags.split(',').map(t => t.trim().toLowerCase()) : [],
      images: images,
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