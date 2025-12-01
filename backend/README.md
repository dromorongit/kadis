# Kadi's Collectionz Admin System

A modern, professional admin panel for managing Kadi's Collectionz e-commerce products.

## Features

- 🔐 **Secure Authentication** - Register/Login with session management
- 📊 **Dashboard** - Overview of products, statistics, and recent activity
- 🛍️ **Product Management** - Full CRUD operations for products
- 🎨 **Modern UI** - Beautiful, responsive design with Bootstrap 5
- 📱 **Mobile Friendly** - Optimized for all devices
- 🔍 **Advanced Search** - Filter and search products by various criteria
- ⭐ **Featured Products** - Mark products for homepage display
- 🏷️ **Categories & Tags** - Organize products efficiently
- 💰 **Pricing Management** - Regular, old, and promo prices
- 📏 **Dimensions & Weight** - Complete product specifications

## Tech Stack

- **Backend**: Node.js, Express.js
- **Database**: MongoDB (Railway built-in)
- **Frontend**: EJS templates, Bootstrap 5, Vanilla JavaScript
- **Authentication**: Session-based with bcrypt
- **Deployment**: Railway

## Installation

1. **Clone the repository**
   ```bash
   git clone <repository-url>
   cd kadis-collectionz/backend
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Environment Setup**
   ```bash
   cp .env.example .env
   ```
   Edit `.env` with your configuration:
   ```env
   NODE_ENV=development
   PORT=3000
   MONGODB_URI=your-railway-mongodb-uri
   SESSION_SECRET=your-super-secret-key
   ```

4. **Start Development Server**
   ```bash
   npm run dev
   ```

5. **Access Admin Panel**
   - Open `http://localhost:3000`
   - Register a new admin account or login

## Frontend Integration

The frontend is automatically configured to connect to the backend API:

- **API Endpoints**: The frontend fetches data from `/api/products`
- **Fallback**: If the API is unavailable, it falls back to local `data/products.json`
- **Real-time Updates**: Changes made in the admin panel are immediately reflected on the frontend

### API Endpoints

- `GET /api/products` - Get all products (with optional filters)
- `GET /api/products/:id` - Get single product details
- `POST /api/orders` - Submit orders from checkout

### Query Parameters

- `?category=Men` - Filter by category
- `?subcategory=Fashion` - Filter by subcategory
- `?featured=true` - Get only featured products
- `?search=term` - Search in product titles and descriptions

## Database Seeding

To populate your database with sample data:

```bash
npm run seed
```

This will import all products from `data/products.json` into your MongoDB database.

## Deployment to Railway

1. **Connect Repository**
   - Link your GitHub repository to Railway
   - Set the root directory to `/backend`

2. **Environment Variables**
   Set these in Railway dashboard:
   ```
   NODE_ENV=production
   MONGODB_URI=your-railway-mongodb-connection-string
   SESSION_SECRET=your-secure-random-string
   ```

3. **Database**
   - Railway provides built-in MongoDB
   - Use the connection string from Railway dashboard

4. **Deploy**
   - Railway will automatically build and deploy
   - Access your admin panel at the provided Railway URL

## Product Fields

Each product includes:

- **Basic Info**: ID, Title, Brand, Category (Men/Women)
- **Descriptions**: Short and long descriptions
- **Pricing**: Regular price, old price, promo price with toggle
- **Inventory**: Stock quantity, sizes, in-stock status
- **Media**: Multiple image URLs
- **Organization**: Tags, featured status
- **Specifications**: Dimensions, weight, material, care instructions

## API Endpoints

- `GET /` - Redirect to login/dashboard
- `GET /login` - Login page
- `POST /login` - Authenticate user
- `GET /register` - Registration page
- `POST /register` - Create new admin account
- `POST /logout` - Logout user
- `GET /admin` - Dashboard (protected)
- `GET /products` - List products (protected)
- `GET /products/new` - Add product form (protected)
- `POST /products` - Create product (protected)
- `GET /products/:id/edit` - Edit product form (protected)
- `PUT /products/:id` - Update product (protected)
- `DELETE /products/:id` - Delete product (protected)

## Security Features

- Password hashing with bcrypt
- Session-based authentication
- CSRF protection
- Input validation and sanitization
- SQL injection prevention
- XSS protection

## File Structure

```
backend/
├── models/
│   ├── User.js          # User model
│   └── Product.js       # Product model
├── routes/
│   ├── auth.js          # Authentication routes
│   └── products.js      # Product CRUD routes
├── views/
│   ├── layouts/
│   │   ├── main.ejs     # Main layout
│   │   └── partials/
│   │       └── navbar.ejs
│   ├── auth/
│   │   ├── login.ejs
│   │   └── register.ejs
│   └── admin/
│       ├── dashboard.ejs
│       └── products/
│           ├── index.ejs
│           ├── new.ejs
│           └── edit.ejs
├── public/
│   ├── css/
│   │   └── admin.css
│   └── js/
│       └── admin.js
├── middleware/
│   └── auth.js          # Authentication middleware
├── .env.example         # Environment template
├── package.json
├── server.js            # Main application file
└── README.md
```

## Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Test thoroughly
5. Submit a pull request

## License

This project is licensed under the MIT License.

## Support

For support or questions, please contact the development team.