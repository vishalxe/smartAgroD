const firebaseAuth = require('../services/firebaseAuth');

// Middleware to verify Firebase token
const verifyToken = async (req, res, next) => {
    try {
        const token = req.headers.authorization?.split(' ')[1] || 
                     req.cookies?.authToken || 
                     req.session?.authToken;

        if (!token) {
            return res.status(401).json({
                success: false,
                message: 'Access token required'
            });
        }

        const result = await firebaseAuth.verifyToken(token);
        
        if (!result.success) {
            return res.status(401).json({
                success: false,
                message: result.error || 'Invalid token'
            });
        }

        req.user = result.user;
        next();
    } catch (error) {
        console.error('Auth middleware error:', error);
        res.status(500).json({
            success: false,
            message: 'Authentication error'
        });
    }
};

// Middleware to check if user is authenticated (for session-based auth)
const requireAuth = (req, res, next) => {
    console.log('requireAuth check:', {
        hasSession: !!req.session,
        hasUser: !!(req.session && req.session.user),
        sessionUser: req.session?.user,
        path: req.path
    });

    if (req.session && req.session.user) {
        req.user = req.session.user;
        next();
    } else {
        // Check if this is an API call (has /api/ in path)
        if (req.path.startsWith('/api/')) {
            return res.status(401).json({
                success: false,
                message: 'Authentication required'
            });
        } else {
            // For page requests, redirect to login
            res.redirect('/login');
        }
    }
};

// Middleware to check if user is admin
const requireAdmin = (req, res, next) => {
    if (req.session && req.session.admin) {
        req.user = req.session.admin;
        next();
    } else {
        res.redirect('/admin/login');
    }
};

// Middleware to check user role
const requireRole = (roles) => {
    return (req, res, next) => {
        if (!req.user) {
            return res.status(401).json({
                success: false,
                message: 'Authentication required'
            });
        }

        const userRole = req.user.role || req.session?.user?.role;
        
        if (!roles.includes(userRole)) {
            return res.status(403).json({
                success: false,
                message: 'Insufficient permissions'
            });
        }

        next();
    };
};

// Middleware to check if user is a farmer
const requireFarmer = requireRole(['farmer', 'admin']);

// Middleware to check if user is an admin
const requireAdminRole = requireRole(['admin']);

// Optional authentication middleware
const optionalAuth = async (req, res, next) => {
    try {
        const token = req.headers.authorization?.split(' ')[1] || 
                     req.cookies?.authToken || 
                     req.session?.authToken;

        if (token) {
            const result = await firebaseAuth.verifyToken(token);
            if (result.success) {
                req.user = result.user;
            }
        }
        next();
    } catch (error) {
        // Continue without authentication
        next();
    }
};

module.exports = {
    verifyToken,
    requireAuth,
    requireAdmin,
    requireRole,
    requireFarmer,
    requireAdminRole,
    optionalAuth
}; 