const express = require('express');
const router = express.Router();
const Product = require('../models/Product');

// GET /api/products - Get all products for frontend
router.get('/products', async (req, res) => {
  try {
    const filter = { isActive: true };

    // Filter by category if provided
    if (req.query.category) {
      filter.category = req.query.category;
    }



    // Search functionality
    if (req.query.search) {
      filter.$text = { $search: req.query.search };
    }

    // Featured products filter
    if (req.query.featured === 'true') {
      filter.featured = true;
    }

    const products = await Product.find(filter)
      .sort({ createdAt: -1 })
      .select('-__v -createdAt -updatedAt'); // Exclude internal fields

    // Transform data to match frontend expectations
    const transformedProducts = products.map(product => ({
      id: product.id,
      title: product.title,
      slug: product.slug,
      category: product.category,
      price: product.price,
      old_price: product.oldPrice,
      currency: '₵',
      images: product.images.map(img => img.startsWith('http') ? img : `${process.env.BASE_URL}${img}`),
      description: product.longDescription, // Frontend expects 'description'
      shortDescription: product.shortDescription,
      sizes: product.sizes,
      stock: product.stockQuantity > 0 ? product.stockQuantity : (product.inStock ? 'infinite' : 0),
      tags: product.tags,
      featured: product.featured,
      brand: product.brand,
      material: product.material,
      careInstructions: product.careInstructions,
      dimensions: product.dimensions,
      weight: product.weight,
      promoPrice: product.promoPrice,
      isPromoActive: product.isPromoActive
    }));

    res.json(transformedProducts);
  } catch (error) {
    console.error('API products error:', error);
    res.status(500).json({ error: 'Failed to load products' });
  }
});

// GET /api/products/:id - Get single product
router.get('/products/:id', async (req, res) => {
  try {
    const product = await Product.findOne({
      id: req.params.id,
      isActive: true
    }).select('-__v -createdAt -updatedAt');

    if (!product) {
      return res.status(404).json({ error: 'Product not found' });
    }

    // Transform data to match frontend expectations
    const transformedProduct = {
      id: product.id,
      title: product.title,
      slug: product.slug,
      category: product.category,
      price: product.price,
      old_price: product.oldPrice,
      currency: '₵',
      images: product.images.map(img => img.startsWith('http') ? img : `${process.env.BASE_URL}${img}`),
      description: product.longDescription,
      shortDescription: product.shortDescription,
      sizes: product.sizes,
      stock: product.stockQuantity > 0 ? product.stockQuantity : (product.inStock ? 'infinite' : 0),
      tags: product.tags,
      featured: product.featured,
      brand: product.brand,
      material: product.material,
      careInstructions: product.careInstructions,
      dimensions: product.dimensions,
      weight: product.weight,
      promoPrice: product.promoPrice,
      isPromoActive: product.isPromoActive
    };

    res.json(transformedProduct);
  } catch (error) {
    console.error('API product error:', error);
    res.status(500).json({ error: 'Failed to load product' });
  }
});

// POST /api/orders - Create order (for checkout)
router.post('/orders', async (req, res) => {
  try {
    const orderData = req.body;

    // Here you would typically save to an Order model
    // For now, we'll just return success
    console.log('Order received:', orderData);

    res.json({
      success: true,
      orderId: Date.now().toString(),
      message: 'Order placed successfully'
    });
  } catch (error) {
    console.error('Order creation error:', error);
    res.status(500).json({ error: 'Failed to create order' });
  }
});

module.exports = router;