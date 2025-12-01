# Kadi's Collectionz - Full-Stack E-commerce Platform

A complete e-commerce solution with responsive frontend and powerful admin backend for Kadi's Collectionz.

## 🚀 **What's New**

- **Admin Backend**: Full product management system with user authentication
- **Database Integration**: MongoDB for scalable data storage
- **Real-time Updates**: Frontend automatically syncs with backend changes
- **Subcategory Support**: Products organized by Fashion, Health & Beauty, Electronics
- **Railway Deployment**: Production-ready cloud deployment

## Features

### Frontend (Customer-Facing)
- **Responsive Design**: Mobile-first design that works on all devices
- **Product Catalog**: Browse products by category and subcategory
- **Advanced Filtering**: Filter by Fashion, Health & Beauty, Electronics
- **Shopping Cart**: Add to cart, update quantities, persistent storage
- **Checkout Process**: Complete order form with validation
- **WhatsApp Integration**: Orders sent to owner's WhatsApp
- **Accessibility**: ARIA labels, keyboard navigation, screen reader support

### Backend (Admin System)
- **Secure Authentication**: Admin login/registration with session management
- **Product Management**: Full CRUD operations with rich product data
- **Dashboard**: Statistics, recent products, and quick actions
- **Subcategory Support**: Organize products hierarchically
- **Search & Filter**: Advanced admin search and filtering
- **Real-time Sync**: Frontend automatically reflects backend changes

## Brand Colors

- Black: #000000
- Gold: #D4AF37
- White: #FFFFFF

## Project Structure

```
kadis-collectionz/
├── index.html              # Home page (Frontend)
├── pages/                  # Frontend page templates
│   ├── men.html
│   ├── women.html
│   ├── product.html
│   ├── cart.html
│   ├── checkout.html
│   ├── order-confirmation.html
│   ├── about.html
│   └── contact.html
├── css/
│   └── styles.css          # Frontend stylesheet
├── js/
│   └── app.js              # Frontend JavaScript
├── data/
│   ├── products.json       # Fallback product data
│   └── orders.json         # Order storage
├── assets/                 # Images and media
│   ├── logo.png
│   ├── favicon.ico
│   ├── og-image.png
│   └── products/           # Product images
└── backend/                # Admin Backend System
    ├── models/             # MongoDB schemas
    ├── routes/             # API endpoints
    ├── views/              # Admin templates
    ├── public/             # Admin assets
    ├── middleware/         # Authentication
    ├── server.js           # Backend server
    ├── package.json        # Backend dependencies
    └── README.md           # Backend setup guide
```

## Quick Start

### Option 1: Frontend Only (Static)
1. **Open `index.html`** in a web browser to view the site
2. Products load from `data/products.json`
3. Orders are sent via WhatsApp links

### Option 2: Full Stack (Recommended)
1. **Set up Backend** (see Backend Setup below)
2. **Frontend automatically connects** to backend API
3. **Real-time product management** through admin panel

## Backend Setup

1. **Navigate to backend directory**
   ```bash
   cd backend
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Environment Setup**
   ```bash
   cp .env.example .env
   ```
   Configure your `.env` file with MongoDB connection and session secret.

4. **Seed Database** (Optional)
   ```bash
   npm run seed
   ```

5. **Start Backend Server**
   ```bash
   npm run dev
   ```

6. **Access Admin Panel**
   - Visit `http://localhost:3000`
   - Register admin account
   - Start managing products

## Frontend Configuration

1. **Update WhatsApp Number**
   - Replace `OWNER_WHATSAPP_NUMBER` in `js/app.js` with your international WhatsApp number
   - Update contact info in `pages/contact.html`

2. **Replace Images**
   - Add your logo and product images to `assets/`
   - Update image paths in product data

3. **Deploy Frontend**
   - Use GitHub Pages, Vercel, or Netlify
   - Frontend automatically detects backend API

## Integration

- **API Connection**: Frontend fetches from `/api/products` when backend is available
- **Fallback**: Uses local `data/products.json` if API fails
- **Real-time Sync**: Admin changes immediately appear on frontend

## WhatsApp Integration

### Option 1: Client-side wa.me link (Default)
- Orders open WhatsApp on customer's device with pre-filled message
- No server required, works immediately
- Replace `OWNER_WHATSAPP_NUMBER` with international format

### Option 2: Server-side WhatsApp API (Production)
For automated sending without customer interaction:

1. Set up a serverless function (e.g., on Vercel/Netlify)
2. Use Twilio WhatsApp API or WhatsApp Business API
3. Set environment variables:
   - `TWILIO_ACCOUNT_SID`
   - `TWILIO_AUTH_TOKEN`
   - `WHATSAPP_FROM`
   - `OWNER_WHATSAPP_NUMBER`
4. Update `js/app.js` to call the API endpoint instead of wa.me

## Deployment

### Static Hosting (Recommended)
- **Vercel**: Connect GitHub repo, deploy automatically
- **Netlify**: Drag & drop files or connect repo
- **GitHub Pages**: Enable in repository settings

### With Serverless Functions
- Use Vercel Functions or Netlify Functions for order processing
- Store orders in a database or send via email/WhatsApp API

## Product Management

### Frontend (Static Mode)
- Products stored in `data/products.json`
- Basic schema: id, title, category, subcategory, price, images, etc.
- Edit JSON file directly for product changes

### Backend (Admin Mode)
- **Admin Dashboard**: `http://localhost:3000` (when backend is running)
- **Full CRUD**: Create, read, update, delete products
- **Rich Data**: All product fields including dimensions, materials, care instructions
- **Subcategories**: Fashion, Health & Beauty, Electronics
- **Search & Filter**: Advanced admin search and filtering
- **Real-time Sync**: Frontend automatically shows backend changes

### Product Schema
```javascript
{
  id: "unique-id",
  title: "Product Name",
  category: "Men|Women",
  subcategory: "Fashion|Health & Beauty|Electronics",
  price: 25.00,
  images: ["url1.jpg", "url2.jpg"],
  description: "Full description",
  sizes: ["S", "M", "L"],
  featured: true,
  brand: "Brand Name",
  material: "Cotton",
  dimensions: { length: 10, width: 5, height: 2 },
  weight: 0.5,
  careInstructions: "Machine wash cold"
}
```

## Browser Support

- Chrome 70+
- Firefox 65+
- Safari 12+
- Edge 79+

## Development

- No build process required
- Edit HTML, CSS, JS directly
- Test in multiple browsers and devices
- Use browser dev tools for debugging

## License

© 2025 Kadi's Collectionz. All rights reserved.

## Contact

For support or customization requests, contact the development team.