const firebaseAuth = require('../services/firebaseAuth');
const localStorage = require('../services/localStorage');

// General login function that handles different user roles
const login = async (req, res) => {
    try {
        const { email, password, role } = req.body;
        
        if (!email || !password) {
            return res.status(400).json({
                success: false,
                message: 'Email and password are required'
            });
        }

        if (!role || !['buyer', 'farmer', 'admin'].includes(role)) {
            return res.status(400).json({
                success: false,
                message: 'Valid role (buyer, farmer, admin) is required'
            });
        }

        // Demo user credentials for testing
        const demoUsers = {
            'buyer@demo.com': { password: 'password123', role: 'buyer', name: 'John Buyer' },
            'farmer@demo.com': { password: 'password123', role: 'farmer', name: 'John Farmer' },
            'admin@demo.com': { password: 'password123', role: 'admin', name: 'Admin User' }
        };

        const user = demoUsers[email];
        if (!user || user.password !== password || user.role !== role) {
            return res.status(401).json({
                success: false,
                message: 'Invalid credentials or role mismatch'
            });
        }

        const uid = `${user.role}_${Date.now()}`;

        // Store in session
        req.session.user = {
            uid,
            email,
            name: user.name,
            role: user.role
        };

        console.log('Session created:', req.session.user);
        console.log('Session ID:', req.sessionID);

        // Check if user exists in local storage, create if not
        let localUser = await localStorage.getUserByEmail(email);
        if (!localUser) {
            localUser = await localStorage.createUser({
                uid,
                email,
                name: user.name,
                role: user.role
            });
        }

        res.json({
            success: true,
            message: 'Login successful',
            user: {
                uid,
                email,
                name: user.name,
                role: user.role
            }
        });
    } catch (error) {
        console.error('Login error:', error);
        res.status(500).json({
            success: false,
            message: 'Login failed'
        });
    }
};

// Firebase authentication login
const firebaseLogin = async (req, res) => {
    try {
        const { idToken, role } = req.body;
        
        if (!idToken) {
            return res.status(400).json({
                success: false,
                message: 'Firebase ID token is required'
            });
        }

        if (!role || !['buyer', 'farmer', 'admin'].includes(role)) {
            return res.status(400).json({
                success: false,
                message: 'Valid role (buyer, farmer, admin) is required'
            });
        }

        const result = await firebaseAuth.verifyToken(idToken);
        
        if (!result.success) {
            return res.status(401).json({
                success: false,
                message: result.error || 'Authentication failed'
            });
        }

        const user = result.user;
        
        // Store user in session for traditional web app support
        req.session.user = {
            uid: user.uid,
            email: user.email,
            name: user.name,
            role: role
        };

        console.log('Session created:', req.session.user);

        // Check if user exists in local storage, create if not
        let localUser = await localStorage.getUserByEmail(user.email);
        if (!localUser) {
            localUser = await localStorage.createUser({
                uid: user.uid,
                email: user.email,
                name: user.name,
                role: role
            });
        }

        res.json({
            success: true,
            message: 'Login successful',
            user: {
                uid: user.uid,
                email: user.email,
                name: user.name,
                role: role
            }
        });
    } catch (error) {
        console.error('Firebase login error:', error);
        res.status(500).json({
            success: false,
            message: 'Login failed'
        });
    }
};

// Mock login for development (when Firebase is not configured)
const mockLogin = async (req, res) => {
    try {
        const { email, password, role = 'user' } = req.body;
        
        if (!email || !password) {
            return res.status(400).json({
                success: false,
                message: 'Email and password are required'
            });
        }

        // Simple mock authentication
        const mockUsers = {
            'user@example.com': { password: 'password123', role: 'user' },
            'farmer@example.com': { password: 'password123', role: 'farmer' },
            'admin@example.com': { password: 'password123', role: 'admin' }
        };

        const user = mockUsers[email];
        if (!user || user.password !== password) {
            return res.status(401).json({
                success: false,
                message: 'Invalid credentials'
            });
        }

        const uid = `${user.role}123`;
        const name = email.split('@')[0];

        // Store in session
        req.session.user = {
            uid,
            email,
            name,
            role: user.role
        };

        // Check if user exists in local storage, create if not
        let localUser = await localStorage.getUserByEmail(email);
        if (!localUser) {
            localUser = await localStorage.createUser({
                uid,
                email,
                name,
                role: user.role
            });
        }

        res.json({
            success: true,
            message: 'Login successful',
            user: {
                uid,
                email,
                name,
                role: user.role
            },
            token: `mock-${user.role}-token`
        });
    } catch (error) {
        console.error('Mock login error:', error);
        res.status(500).json({
            success: false,
            message: 'Login failed'
        });
    }
};

// Logout
const logout = (req, res) => {
    try {
        // Clear session
        req.session.destroy((err) => {
            if (err) {
                console.error('Session destroy error:', err);
            }
        });

        // Clear cookies
        res.clearCookie('connect.sid');
        res.clearCookie('authToken');

        res.json({
            success: true,
            message: 'Logout successful'
        });
    } catch (error) {
        console.error('Logout error:', error);
        res.status(500).json({
            success: false,
            message: 'Logout failed'
        });
    }
};

// Get current user
const getCurrentUser = async (req, res) => {
    try {
        if (!req.user) {
            return res.status(401).json({
                success: false,
                message: 'Not authenticated'
            });
        }

        res.json({
            success: true,
            user: req.user
        });
    } catch (error) {
        console.error('Get current user error:', error);
        res.status(500).json({
            success: false,
            message: 'Error fetching user data'
        });
    }
};

// Update user profile
const updateProfile = async (req, res) => {
    try {
        if (!req.user) {
            return res.status(401).json({
                success: false,
                message: 'Not authenticated'
            });
        }

        const { name, role } = req.body;
        const updateData = {};

        if (name) updateData.name = name;
        if (role) updateData.role = role;

        const updatedUser = await localStorage.updateUser(req.user.uid, updateData);
        
        if (updatedUser) {
            // Update session
            req.session.user = {
                ...req.session.user,
                ...updateData
            };
        }

        res.json({
            success: true,
            message: 'Profile updated successfully',
            user: updatedUser || req.user
        });
    } catch (error) {
        console.error('Update profile error:', error);
        res.status(500).json({
            success: false,
            message: 'Error updating profile'
        });
    }
};

// Get authentication status
const getAuthStatus = (req, res) => {
    try {
        const status = firebaseAuth.getAuthStatus();
        res.json({
            success: true,
            auth: status,
            session: {
                authenticated: !!req.session.user,
                user: req.session.user || null
            }
        });
    } catch (error) {
        console.error('Get auth status error:', error);
        res.status(500).json({
            success: false,
            message: 'Error fetching auth status'
        });
    }
};

// Register new user (for development/testing)
const registerUser = async (req, res) => {
    try {
        const { email, password, name, role = 'user' } = req.body;
        
        if (!email || !password || !name) {
            return res.status(400).json({
                success: false,
                message: 'Email, password, and name are required'
            });
        }

        // Check if user already exists
        const existingUser = await localStorage.getUserByEmail(email);
        if (existingUser) {
            return res.status(400).json({
                success: false,
                message: 'User already exists'
            });
        }

        const uid = Date.now().toString();
        const newUser = await localStorage.createUser({
            uid,
            email,
            name,
            role
        });

        res.status(201).json({
            success: true,
            message: 'User registered successfully',
            user: newUser
        });
    } catch (error) {
        console.error('Register user error:', error);
        res.status(500).json({
            success: false,
            message: 'Registration failed'
        });
    }
};

// Get Firebase configuration for frontend
const getFirebaseConfig = (req, res) => {
    try {
        const config = {
            apiKey: process.env.FIREBASE_API_KEY,
            authDomain: process.env.FIREBASE_AUTH_DOMAIN,
            projectId: process.env.FIREBASE_PROJECT_ID,
            storageBucket: process.env.FIREBASE_STORAGE_BUCKET,
            messagingSenderId: process.env.FIREBASE_MESSAGING_SENDER_ID,
            appId: process.env.FIREBASE_APP_ID
        };

        // Check if all required config values are present
        const requiredFields = ['apiKey', 'authDomain', 'projectId', 'storageBucket', 'messagingSenderId', 'appId'];
        const missingFields = requiredFields.filter(field => !config[field]);

        if (missingFields.length > 0) {
            return res.status(500).json({
                success: false,
                message: 'Firebase configuration incomplete',
                missingFields
            });
        }

        res.json({
            success: true,
            config
        });
    } catch (error) {
        console.error('Get Firebase config error:', error);
        res.status(500).json({
            success: false,
            message: 'Error fetching Firebase configuration'
        });
    }
};

module.exports = {
    login,
    firebaseLogin,
    mockLogin,
    logout,
    getCurrentUser,
    updateProfile,
    getAuthStatus,
    registerUser,
    getFirebaseConfig
}; 