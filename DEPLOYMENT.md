# AGRO-SMART Vercel Deployment Guide

## 🚀 Project Ready for Vercel Deployment

Your project has been configured for Vercel deployment as a monorepo with:
- **Backend**: Express.js API deployed as serverless functions
- **Frontend**: Static HTML/CSS/JS files served from `frontend/public/`

## 📋 Pre-Deployment Checklist

### ✅ Already Completed
- [x] Created `api/index.js` for Vercel serverless entry point
- [x] Modified `backend/server.js` to export Express app
- [x] Updated `vercel.json` configuration
- [x] Added `@vendia/serverless-express` dependency
- [x] Configured proper routing for API and static files

## 🔧 Deployment Steps

### 1. Push to GitHub
```bash
git add .
git commit -m "Configure for Vercel deployment"
git push origin main
```

### 2. Connect to Vercel
1. Go to [Vercel Dashboard](https://vercel.com/dashboard)
2. Click **"Add New Project"**
3. Import your GitHub repository
4. Configure project settings:
   - **Framework Preset**: Other
   - **Root Directory**: `/` (project root)
   - **Build Command**: Leave empty (not needed)
   - **Output Directory**: Leave empty (handled by vercel.json)

### 3. Environment Variables Setup
In Vercel Dashboard → Project Settings → Environment Variables, add:

#### Required Variables:
```
NODE_ENV=production
FRONTEND_URL=https://your-vercel-domain.vercel.app
SESSION_SECRET=your-super-secret-session-key
```

#### Optional Variables (if using Firebase/Stripe):
```
STRIPE_SECRET_KEY=sk_test_...
GEMINI_API_KEY=your-gemini-api-key
FIREBASE_PROJECT_ID=your-firebase-project-id
FIREBASE_PRIVATE_KEY=your-firebase-private-key
FIREBASE_CLIENT_EMAIL=your-firebase-client-email
# ... (other Firebase variables as needed)
```

### 4. Deploy
Click **"Deploy"** and wait for the build to complete.

## 🌐 Post-Deployment

### URLs Structure
- **Frontend**: `https://your-domain.vercel.app/`
- **API Endpoints**: `https://your-domain.vercel.app/api/...`
- **Health Check**: `https://your-domain.vercel.app/api/health`

### Testing Your Deployment
1. **Health Check**: Visit `/api/health` to verify backend is working
2. **Frontend**: Visit the root URL to see your homepage
3. **API Testing**: Test endpoints like `/api/products`, `/api/auth`, etc.

## 🔍 Troubleshooting

### Common Issues:

#### 1. API Routes Not Working
- Check that `api/index.js` exists and exports the handler
- Verify `vercel.json` routes are correct
- Ensure all dependencies are in `package.json`

#### 2. Static Files Not Loading
- Verify files are in `frontend/public/`
- Check `vercel.json` static build configuration
- Ensure proper file paths in HTML

#### 3. Environment Variables
- Add all required env vars in Vercel dashboard
- Use production values (not development)
- Check for typos in variable names

#### 4. Session Issues
- Sessions work differently in serverless environment
- Consider using external session storage (Redis, etc.) for production
- Current setup uses in-memory sessions (may not persist across function calls)

## 📁 Project Structure for Vercel

```
/
├── api/
│   └── index.js          # Vercel serverless entry point
├── backend/
│   ├── server.js         # Express app (exported, not started)
│   ├── routes/           # API routes
│   ├── controllers/      # Controllers
│   └── ...
├── frontend/
│   └── public/           # Static files served by Vercel
├── vercel.json           # Vercel configuration
└── package.json          # Dependencies
```

## 🚀 Advanced Configuration

### Custom Domain
1. Go to Vercel Dashboard → Domains
2. Add your custom domain
3. Update `FRONTEND_URL` environment variable

### Environment-Specific Configs
Create different environment variables for:
- `production`
- `preview` (for pull requests)
- `development`

### Performance Optimization
- Enable Vercel's Edge Functions for faster API responses
- Use CDN for static assets
- Implement caching strategies

## 📞 Support

If you encounter issues:
1. Check Vercel deployment logs
2. Verify all environment variables are set
3. Test locally with `vercel dev`
4. Check the health endpoint: `/api/health`

## 🎉 Success!

Once deployed, your AGRO-SMART platform will be live at:
- **Production URL**: `https://your-domain.vercel.app`
- **API Base**: `https://your-domain.vercel.app/api`

Your agricultural e-commerce platform is now ready to serve farmers and consumers worldwide! 🌾 