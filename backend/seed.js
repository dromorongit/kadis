require('dotenv').config();
const mongoose = require('mongoose');
const Product = require('./models/Product');
const fs = require('fs');
const path = require('path');

// Connect to MongoDB
mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/kadis-admin', {
  useNewUrlParser: true,
  useUnifiedTopology: true,
})
.then(() => console.log('MongoDB connected for seeding'))
.catch(err => {
  console.error('MongoDB connection error:', err);
  process.exit(1);
});

async function seedDatabase() {
  try {
    // Read products from JSON file
    const productsPath = path.join(__dirname, '../data/products.json');
    const productsData = JSON.parse(fs.readFileSync(productsPath, 'utf8'));

    console.log(`Found ${productsData.length} products in JSON file`);

    // Clear existing products
    await Product.deleteMany({});
    console.log('Cleared existing products');

    // Transform and insert products
    const productsToInsert = productsData.map(product => ({
      id: product.id,
      title: product.title,
      slug: product.slug,
      category: product.category,
      brand: product.brand,
      shortDescription: product.shortDescription || product.description,
      longDescription: product.description,
      price: product.price,
      oldPrice: product.old_price || null,
      promoPrice: product.promoPrice || null,
      isPromoActive: product.isPromoActive || false,
      images: product.images,
      sizes: product.sizes || [],
      stockQuantity: typeof product.stock === 'number' ? product.stock : (product.stock === 'infinite' ? 999 : 0),
      inStock: product.stock !== 0 && product.stock !== '0',
      tags: product.tags || [],
      featured: product.featured || false,
      material: product.material || '',
      careInstructions: product.careInstructions || '',
      dimensions: product.dimensions || {},
      weight: product.weight || null,
      isActive: true
    }));

    await Product.insertMany(productsToInsert);
    console.log(`Successfully seeded ${productsToInsert.length} products`);

  } catch (error) {
    console.error('Seeding error:', error);
  } finally {
    mongoose.connection.close();
    console.log('Database connection closed');
  }
}

// Run the seed function
seedDatabase();