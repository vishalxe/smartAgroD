# AGRO-SMART 🌾

**Agricultural e-commerce platform connecting farmers with consumers - Local Storage Edition**

## 🚀 Project Status: Ready for Vercel Deployment

Your AGRO-SMART project has been completely configured for Vercel deployment as a monorepo!

### ✅ What's Been Done

- **Backend Configuration**: Express.js API configured for serverless deployment
- **Frontend Setup**: Static files ready for Vercel static hosting
- **API Entry Point**: Created `api/index.js` for Vercel serverless functions
- **Routing**: Configured `vercel.json` for proper API and static file routing
- **Dependencies**: All required packages installed and configured
- **URL Fixes**: Removed hardcoded localhost URLs for production compatibility

### 📁 Project Structure

```
/
├── api/
│   └── index.js          # Vercel serverless entry point
├── backend/
│   ├── server.js         # Express app (exported for serverless)
│   ├── routes/           # API routes
│   ├── controllers/      # Controllers
│   ├── middleware/       # Auth & validation middleware
│   ├── services/         # Firebase, Gemini, Local Storage
│   └── utils/           # Data initialization
├── frontend/
│   └── public/          # Static files (HTML, CSS, JS, Images)
├── data/                # JSON data files
├── vercel.json          # Vercel configuration
├── package.json         # Dependencies
└── DEPLOYMENT.md        # Complete deployment guide
```

## 🚀 Quick Deploy

1. **Push to GitHub**:
   ```bash
   git add .
   git commit -m "Configure for Vercel deployment"
   git push origin main
   ```

2. **Deploy to Vercel**:
   - Go to [Vercel Dashboard](https://vercel.com/dashboard)
   - Click "Add New Project"
   - Import your GitHub repository
   - Deploy!

3. **Set Environment Variables** (in Vercel Dashboard):
   ```
   NODE_ENV=production
   FRONTEND_URL=https://your-vercel-domain.vercel.app
   SESSION_SECRET=your-super-secret-key
   ```

## 🌐 Features

- **User Authentication**: Firebase-based auth with role-based access
- **Product Management**: CRUD operations for agricultural products
- **Payment Integration**: Stripe checkout for secure transactions
- **AI Chatbot**: Gemini-powered agricultural assistance
- **Dashboard**: Separate interfaces for buyers, farmers, and admins
- **Local Storage**: JSON-based data persistence (no database required)

## 🛠️ Local Development

```bash
# Install dependencies
npm install

# Initialize data
npm run init-data

# Start development server
npm run dev

# Test deployment setup
node test-deployment.js
```

## 📚 Documentation

- **Complete Deployment Guide**: See `DEPLOYMENT.md`
- **API Documentation**: See `docs/API.md`
- **Setup Instructions**: See `docs/SETUP.md`

## 🔧 Tech Stack

- **Backend**: Node.js, Express.js
- **Frontend**: HTML5, CSS3, JavaScript, Bootstrap
- **Authentication**: Firebase Admin SDK
- **Payments**: Stripe
- **AI**: Google Gemini API
- **Deployment**: Vercel (Serverless)

## 🌟 Key Features

### For Farmers
- Product listing and management
- Inventory tracking
- Sales analytics
- Government scheme information

### For Buyers
- Browse fresh produce
- Secure checkout
- Order tracking
- AI-powered assistance

### For Admins
- User management
- System monitoring
- Data analytics
- Content management

## 🎯 URLs After Deployment

- **Homepage**: `https://your-domain.vercel.app/`
- **API Base**: `https://your-domain.vercel.app/api/`
- **Health Check**: `https://your-domain.vercel.app/api/health`
- **Buyer Dashboard**: `https://your-domain.vercel.app/buyer-dashboard`
- **Farmer Dashboard**: `https://your-domain.vercel.app/farmer-dashboard`
- **Admin Panel**: `https://your-domain.vercel.app/admin`

## 🚀 Ready to Deploy!

Your AGRO-SMART platform is now completely ready for Vercel deployment. Follow the detailed guide in `DEPLOYMENT.md` for step-by-step instructions.

**Happy Farming! 🌾** 