const admin = require('firebase-admin');
const dotenv = require('dotenv');

dotenv.config();

// Initialize Firebase Admin SDK
let firebaseApp;

try {
    firebaseApp = admin.initializeApp({
        credential: admin.credential.cert({
            projectId: process.env.FIREBASE_PROJECT_ID,
            privateKeyId: process.env.FIREBASE_PRIVATE_KEY_ID,
            privateKey: process.env.FIREBASE_PRIVATE_KEY ? 
                process.env.FIREBASE_PRIVATE_KEY.replace(/\\n/g, '\n') : undefined,
            clientEmail: process.env.FIREBASE_CLIENT_EMAIL,
            clientId: process.env.FIREBASE_CLIENT_ID,
            authUri: process.env.FIREBASE_AUTH_URI,
            tokenUri: process.env.FIREBASE_TOKEN_URI,
            authProviderX509CertUrl: process.env.FIREBASE_AUTH_PROVIDER_X509_CERT_URL,
            clientX509CertUrl: process.env.FIREBASE_CLIENT_X509_CERT_URL
        })
    });
    console.log('✅ Firebase Admin SDK initialized successfully');
} catch (error) {
    console.warn('⚠️ Firebase Admin SDK initialization failed. Using mock authentication.');
    console.warn('To enable Firebase Auth, please configure your Firebase credentials in .env file');
}

class FirebaseAuthService {
    constructor() {
        this.auth = firebaseApp ? firebaseApp.auth() : null;
        this.isMockMode = !this.auth;
    }

    // Verify Firebase ID token
    async verifyToken(idToken) {
        if (this.isMockMode) {
            // Mock authentication for development
            return this.mockVerifyToken(idToken);
        }

        try {
            const decodedToken = await this.auth.verifyIdToken(idToken);
            return {
                success: true,
                user: {
                    uid: decodedToken.uid,
                    email: decodedToken.email,
                    name: decodedToken.name || decodedToken.email.split('@')[0],
                    role: decodedToken.role || 'user'
                }
            };
        } catch (error) {
            console.error('Firebase token verification error:', error);
            return {
                success: false,
                error: 'Invalid token'
            };
        }
    }

    // Mock authentication for development
    mockVerifyToken(token) {
        // Simple mock tokens for development
        const mockUsers = {
            'mock-user-token': {
                uid: 'user123',
                email: 'user@example.com',
                name: 'John User',
                role: 'user'
            },
            'mock-farmer-token': {
                uid: 'farmer123',
                email: 'farmer@example.com',
                name: 'Jane Farmer',
                role: 'farmer'
            },
            'mock-admin-token': {
                uid: 'admin123',
                email: 'admin@example.com',
                name: 'Admin User',
                role: 'admin'
            }
        };

        const user = mockUsers[token];
        if (user) {
            return {
                success: true,
                user
            };
        }

        return {
            success: false,
            error: 'Invalid mock token'
        };
    }

    // Create custom token (for testing)
    async createCustomToken(uid, additionalClaims = {}) {
        if (this.isMockMode) {
            return {
                success: true,
                token: `mock-${uid}-token`
            };
        }

        try {
            const token = await this.auth.createCustomToken(uid, additionalClaims);
            return {
                success: true,
                token
            };
        } catch (error) {
            console.error('Error creating custom token:', error);
            return {
                success: false,
                error: error.message
            };
        }
    }

    // Get user by UID
    async getUserByUid(uid) {
        if (this.isMockMode) {
            const mockUsers = {
                'user123': {
                    uid: 'user123',
                    email: 'user@example.com',
                    name: 'John User',
                    role: 'user'
                },
                'farmer123': {
                    uid: 'farmer123',
                    email: 'farmer@example.com',
                    name: 'Jane Farmer',
                    role: 'farmer'
                },
                'admin123': {
                    uid: 'admin123',
                    email: 'admin@example.com',
                    name: 'Admin User',
                    role: 'admin'
                }
            };
            return mockUsers[uid] || null;
        }

        try {
            const userRecord = await this.auth.getUser(uid);
            return {
                uid: userRecord.uid,
                email: userRecord.email,
                name: userRecord.displayName || userRecord.email.split('@')[0],
                role: userRecord.customClaims?.role || 'user'
            };
        } catch (error) {
            console.error('Error getting user by UID:', error);
            return null;
        }
    }

    // Set user role
    async setUserRole(uid, role) {
        if (this.isMockMode) {
            return { success: true };
        }

        try {
            await this.auth.setCustomUserClaims(uid, { role });
            return { success: true };
        } catch (error) {
            console.error('Error setting user role:', error);
            return { success: false, error: error.message };
        }
    }

    // Check if service is in mock mode
    isMockMode() {
        return this.isMockMode;
    }

    // Get authentication status
    getAuthStatus() {
        return {
            initialized: !!this.auth,
            mockMode: this.isMockMode,
            projectId: process.env.FIREBASE_PROJECT_ID || 'Not configured'
        };
    }
}

module.exports = new FirebaseAuthService(); 