# AGRO-SMART Setup Guide

## Prerequisites

Before setting up the project, ensure you have the following installed:

- **Node.js** (version 14 or higher)
- **npm** (comes with Node.js)
- **MongoDB** (version 4.4 or higher)
- **Git** (for version control)

## Installation Steps

### 1. Clone the Repository

```bash
git clone <repository-url>
cd agro-smart
```

### 2. Install Dependencies

```bash
npm install
```

### 3. Environment Configuration

Copy the example environment file and configure it:

```bash
cp env.example .env
```

Edit the `.env` file with your configuration:

```env
# Server Configuration
PORT=3001
NODE_ENV=development

# Database Configuration
MONGODB_URI=mongodb://127.0.0.1:27017/farm4

# Session Configuration
SESSION_SECRET=your-super-secret-session-key-change-this-in-production

# Stripe Configuration (get these from your Stripe dashboard)
STRIPE_SECRET_KEY=sk_test_...
STRIPE_WEBHOOK_SECRET=whsec_...

# Frontend URL
FRONTEND_URL=http://localhost:3001
```

### 4. Database Setup

Start MongoDB service:

```bash
# On Windows
net start MongoDB

# On macOS/Linux
sudo systemctl start mongod
```

### 5. Run Database Migration

```bash
node backend/utils/migrateData.js
```

### 6. Start the Application

#### Development Mode
```bash
npm run dev
```

#### Production Mode
```bash
npm start
```

The application will be available at `http://localhost:3001`

## Project Structure

```
agro-smart/
├── backend/                 # Server-side code
│   ├── config/             # Configuration files
│   │   ├── database.js     # Database connection
│   │   └── multer.js       # File upload configuration
│   ├── controllers/        # Route controllers
│   │   ├── authController.js
│   │   └── productController.js
│   ├── middleware/         # Custom middleware
│   │   ├── auth.js         # Authentication middleware
│   │   └── validation.js   # Input validation
│   ├── models/            # Database models
│   │   ├── User.js
│   │   ├── Admin.js
│   │   ├── Product.js
│   │   └── Availability.js
│   ├── routes/            # API routes
│   │   ├── auth.js
│   │   ├── products.js
│   │   └── payments.js
│   ├── utils/             # Utility functions
│   │   └── migrateData.js
│   └── server.js          # Main server file
├── frontend/              # Client-side code
│   ├── public/            # Static assets
│   │   ├── css/          # Stylesheets
│   │   ├── js/           # JavaScript files
│   │   ├── images/       # Images
│   │   ├── uploads/      # Uploaded files
│   │   └── bootstrap-5.0.2-dist/
│   └── views/            # HTML templates
├── docs/                 # Documentation
├── package.json          # Dependencies
└── env.example           # Environment template
```

## Configuration Details

### Database Configuration

The application uses MongoDB as the database. Make sure MongoDB is running and accessible at the configured URI.

### File Upload Configuration

- **Maximum file size**: 5MB
- **Allowed file types**: jpg, jpeg, png, gif, webp
- **Upload directory**: `frontend/public/uploads/`

### Session Configuration

- **Secret**: Configure a strong secret key in production
- **Duration**: 24 hours
- **Secure**: Enabled in production mode

### Stripe Configuration

1. Create a Stripe account at [stripe.com](https://stripe.com)
2. Get your API keys from the dashboard
3. Configure webhook endpoints for payment notifications

## Development Workflow

### Adding New Features

1. Create feature branch: `git checkout -b feature/new-feature`
2. Make changes in appropriate directories
3. Test your changes
4. Commit and push: `git push origin feature/new-feature`
5. Create pull request

### Code Structure Guidelines

- **Controllers**: Handle HTTP requests and responses
- **Models**: Define database schemas and validation
- **Routes**: Define API endpoints
- **Middleware**: Handle authentication, validation, etc.
- **Services**: Business logic (if needed)
- **Utils**: Helper functions and utilities

### API Development

- Follow RESTful conventions
- Use proper HTTP status codes
- Implement proper error handling
- Add input validation
- Document API endpoints

## Testing

### Manual Testing

1. **User Registration/Login**: Test user authentication
2. **Admin Panel**: Test admin functionality
3. **Product Management**: Test CRUD operations
4. **Payment Integration**: Test Stripe checkout
5. **File Upload**: Test image upload functionality

### API Testing

Use tools like Postman or curl to test API endpoints:

```bash
# Test product listing
curl http://localhost:3001/api/products

# Test user login
curl -X POST http://localhost:3001/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"username":"test","password":"test123"}'
```

## Deployment

### Production Checklist

- [ ] Set `NODE_ENV=production`
- [ ] Configure secure session secret
- [ ] Set up HTTPS
- [ ] Configure production database
- [ ] Set up proper logging
- [ ] Configure backup strategy
- [ ] Set up monitoring
- [ ] Configure CDN for static files

### Environment Variables

Ensure all production environment variables are properly configured:

```env
NODE_ENV=production
PORT=3001
MONGODB_URI=mongodb://production-db-url
SESSION_SECRET=very-secure-secret-key
STRIPE_SECRET_KEY=sk_live_...
STRIPE_WEBHOOK_SECRET=whsec_...
FRONTEND_URL=https://yourdomain.com
```

## Troubleshooting

### Common Issues

1. **MongoDB Connection Error**
   - Ensure MongoDB is running
   - Check connection string in `.env`
   - Verify network connectivity

2. **File Upload Issues**
   - Check upload directory permissions
   - Verify file size limits
   - Ensure allowed file types

3. **Session Issues**
   - Check session secret configuration
   - Verify cookie settings
   - Check browser cookie settings

4. **Payment Issues**
   - Verify Stripe API keys
   - Check webhook configuration
   - Test with Stripe test mode first

### Logs

Check application logs for detailed error information:

```bash
# View logs in development
npm run dev

# View logs in production
pm2 logs agro-smart
```

## Support

For issues and questions:

1. Check the documentation in `/docs`
2. Review API documentation
3. Check existing issues on GitHub
4. Create a new issue with detailed information

## Contributing

See [CONTRIBUTING.md](CONTRIBUTING.md) for contribution guidelines. 