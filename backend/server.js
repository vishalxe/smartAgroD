const express = require('express');
const session = require('express-session');
const cors = require('cors');
const path = require('path');
const dotenv = require('dotenv');

// Import services
const localStorage = require('./services/localStorage');
const firebaseAuth = require('./services/firebaseAuth');

// Import routes
const authRoutes = require('./routes/auth');
const productRoutes = require('./routes/products');
const paymentRoutes = require('./routes/payments');
const schemesRoutes = require('./routes/schemes');
const chatbotRoutes = require('./routes/chatbot');

// Load environment variables
dotenv.config();

const app = express();
const PORT = process.env.PORT || 3001;

// Middleware
app.use(cors({
    origin: process.env.NODE_ENV === 'production' 
        ? process.env.FRONTEND_URL 
        : 'http://localhost:3001',
    credentials: true
}));

app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Session configuration
app.use(session({
    secret: process.env.SESSION_SECRET || 'your-secret-key',
    resave: false,
    saveUninitialized: false,
    cookie: {
        secure: process.env.NODE_ENV === 'production', // false in development
        httpOnly: true,
        sameSite: process.env.NODE_ENV === 'production' ? 'strict' : 'lax',
        maxAge: 24 * 60 * 60 * 1000 // 24 hours
    }
}));

// Serve static files
app.use(express.static(path.join(__dirname, '../frontend/public')));

// API Routes
app.use('/api/auth', authRoutes);
app.use('/api/products', productRoutes);
app.use('/api/payments', paymentRoutes);
app.use('/api/schemes', schemesRoutes);
app.use('/api/chatbot', chatbotRoutes);

// Availability API (legacy support - now using local storage)
app.get('/api/availability/:product', async (req, res) => {
    try {
        const data = await localStorage.getAvailability(req.params.product);
        if (!data) {
            return res.status(404).json({ message: "Product not found" });
        }
        res.json(data);
    } catch (error) {
        console.error('Availability error:', error);
        res.status(500).json({ message: "Server error" });
    }
});

// Health check endpoint
app.get('/api/health', (req, res) => {
    res.json({
        status: 'OK',
        timestamp: new Date().toISOString(),
        storage: 'Local JSON Files',
        auth: firebaseAuth.getAuthStatus(),
        stripe: process.env.STRIPE_SECRET_KEY ? 'Configured' : 'Not Configured'
    });
});

// Debug session endpoint
app.get('/api/debug/session', (req, res) => {
    res.json({
        hasSession: !!req.session,
        sessionID: req.sessionID,
        sessionUser: req.session?.user,
        cookies: req.headers.cookie,
        userAgent: req.headers['user-agent']
    });
});

// Data statistics endpoint
app.get('/api/stats', async (req, res) => {
    try {
        const stats = await localStorage.getDataStats();
        res.json({
            success: true,
            stats: stats
        });
    } catch (error) {
        console.error('Stats error:', error);
        res.status(500).json({
            success: false,
            message: 'Error fetching statistics'
        });
    }
});

// Frontend Routes
app.get('/', (req, res) => {
    res.sendFile(path.join(__dirname, '../frontend/views/index.html'));
});

app.get('/login', (req, res) => {
    res.sendFile(path.join(__dirname, '../frontend/views/login.html'));
});

// User Role-based Dashboard Routes
app.get('/buyer-dashboard', (req, res) => {
    console.log('Buyer dashboard access check:', {
        hasSession: !!req.session,
        hasUser: !!(req.session && req.session.user),
        sessionUser: req.session?.user,
        userRole: req.session?.user?.role
    });

    if (req.session.user && req.session.user.role === 'buyer') {
        res.sendFile(path.join(__dirname, '../frontend/views/buyer-dashboard.html'));
    } else {
        console.log('Redirecting to login - session validation failed');
        res.redirect('/login');
    }
});

app.get('/farmer-dashboard', (req, res) => {
    console.log('Farmer dashboard access check:', {
        hasSession: !!req.session,
        hasUser: !!(req.session && req.session.user),
        sessionUser: req.session?.user,
        userRole: req.session?.user?.role
    });

    if (req.session.user && req.session.user.role === 'farmer') {
        res.sendFile(path.join(__dirname, '../frontend/views/farmer-dashboard.html'));
    } else {
        console.log('Redirecting to login - session validation failed');
        res.redirect('/login');
    }
});

app.get('/admin', (req, res) => {
    if (req.session.user && req.session.user.role === 'admin') {
        res.sendFile(path.join(__dirname, '../frontend/views/admin.html'));
    } else {
        res.redirect('/login');
    }
});

// Legacy routes for backward compatibility
app.get('/homepage', (req, res) => {
    if (req.session.user) {
        // Redirect based on user role
        if (req.session.user.role === 'farmer') {
            res.redirect('/farmer-dashboard');
        } else if (req.session.user.role === 'buyer') {
            res.redirect('/buyer-dashboard');
        } else {
            res.redirect('/admin');
        }
    } else {
        res.redirect('/login');
    }
});

// Product and Shopping Routes
app.get('/agriproduct', (req, res) => {
    res.sendFile(path.join(__dirname, '../frontend/views/agriproduct.html'));
});

app.get('/cart', (req, res) => {
    res.sendFile(path.join(__dirname, '../frontend/views/cart.html'));
});

app.get('/success', (req, res) => {
    res.sendFile(path.join(__dirname, '../frontend/views/success.html'));
});

app.get('/cancel', (req, res) => {
    res.sendFile(path.join(__dirname, '../frontend/views/cancel.html'));
});

// Information Pages
app.get('/aboutus', (req, res) => {
    res.sendFile(path.join(__dirname, '../frontend/views/aboutus.html'));
});

app.get('/contactus', (req, res) => {
    res.sendFile(path.join(__dirname, '../frontend/views/contactus.html'));
});

app.get('/blog', (req, res) => {
    res.sendFile(path.join(__dirname, '../frontend/views/blog.html'));
});

app.get('/season', (req, res) => {
    res.sendFile(path.join(__dirname, '../frontend/views/season.html'));
});

app.get('/financial', (req, res) => {
    res.sendFile(path.join(__dirname, '../frontend/views/financial.html'));
});

// Error handling middleware
app.use((err, req, res, next) => {
    console.error(err.stack);
    res.status(500).json({
        success: false,
        message: 'Something went wrong!'
    });
});

// 404 handler
app.use((req, res) => {
    res.status(404).json({
        success: false,
        message: 'Route not found'
    });
});

// Export the app for Vercel serverless deployment
module.exports = app;

// Only start the server if this file is run directly (not imported)
if (require.main === module) {
    app.listen(PORT, () => {
        console.log(`🚀 AGRO-SMART Server running on http://localhost:${PORT}`);
        console.log(`📁 Environment: ${process.env.NODE_ENV || 'development'}`);
        console.log(`💾 Storage: Local JSON Files`);
        console.log(`🔐 Auth: ${firebaseAuth.getAuthStatus().initialized ? 'Firebase' : 'Mock Mode'}`);
        console.log(`💳 Stripe: ${process.env.STRIPE_SECRET_KEY ? 'Configured' : 'Not Configured'}`);
        console.log(`👥 User Roles: Buyer, Farmer, Admin`);
        console.log(`🎯 Dashboards: /buyer-dashboard, /farmer-dashboard, /admin`);
        console.log(`🌾 Schemes: /api/schemes`);
        console.log(`💳 Payments: /api/payments`);
    });
}