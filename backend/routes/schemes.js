const express = require('express');
const router = express.Router();
const localStorage = require('../services/localStorage');
const { requireAuth } = require('../middleware/auth');

// Get all available schemes
router.get('/', async (req, res) => {
    try {
        const schemes = await localStorage.getAllSchemes();
        res.json({
            success: true,
            schemes: schemes
        });
    } catch (error) {
        console.error('Error fetching schemes:', error);
        res.status(500).json({
            success: false,
            message: 'Error fetching schemes'
        });
    }
});

// Get scheme by ID
router.get('/:id', async (req, res) => {
    try {
        const scheme = await localStorage.getSchemeById(req.params.id);
        if (!scheme) {
            return res.status(404).json({
                success: false,
                message: 'Scheme not found'
            });
        }
        res.json({
            success: true,
            scheme: scheme
        });
    } catch (error) {
        console.error('Error fetching scheme:', error);
        res.status(500).json({
            success: false,
            message: 'Error fetching scheme'
        });
    }
});

// Apply for a scheme (farmer only)
router.post('/:id/apply', requireAuth, async (req, res) => {
    try {
        // Check if user is farmer
        if (req.session.user.role !== 'farmer') {
            return res.status(403).json({
                success: false,
                message: 'Access denied. Only farmers can apply for schemes.'
            });
        }

        const scheme = await localStorage.getSchemeById(req.params.id);
        if (!scheme) {
            return res.status(404).json({
                success: false,
                message: 'Scheme not found'
            });
        }

        if (scheme.status !== 'active') {
            return res.status(400).json({
                success: false,
                message: 'This scheme is not currently active'
            });
        }

        const { personalDetails, landDetails, documents } = req.body;
        
        if (!personalDetails || !landDetails) {
            return res.status(400).json({
                success: false,
                message: 'Personal details and land details are required'
            });
        }

        // Check if farmer has already applied for this scheme
        const existingApplications = await localStorage.getFarmerSchemesByFarmer(req.session.user.uid);
        const alreadyApplied = existingApplications.find(app => app.schemeId === req.params.id);
        
        if (alreadyApplied) {
            return res.status(400).json({
                success: false,
                message: 'You have already applied for this scheme'
            });
        }

        const farmerScheme = await localStorage.createFarmerScheme({
            schemeId: req.params.id,
            farmerId: req.session.user.uid,
            farmerEmail: req.session.user.email,
            farmerName: req.session.user.name,
            schemeName: scheme.name,
            personalDetails,
            landDetails,
            documents: documents || [],
            status: 'pending'
        });

        res.json({
            success: true,
            application: farmerScheme,
            message: 'Scheme application submitted successfully'
        });
    } catch (error) {
        console.error('Error applying for scheme:', error);
        res.status(500).json({
            success: false,
            message: 'Error applying for scheme'
        });
    }
});

// Get farmer's scheme applications
router.get('/applications/my', requireAuth, async (req, res) => {
    try {
        // Check if user is farmer
        if (req.session.user.role !== 'farmer') {
            return res.status(403).json({
                success: false,
                message: 'Access denied. Only farmers can view their applications.'
            });
        }

        const applications = await localStorage.getFarmerSchemesByFarmer(req.session.user.uid);
        
        // Get scheme details for each application
        const applicationsWithDetails = await Promise.all(
            applications.map(async (app) => {
                const scheme = await localStorage.getSchemeById(app.schemeId);
                return {
                    ...app,
                    scheme: scheme
                };
            })
        );

        res.json({
            success: true,
            applications: applicationsWithDetails
        });
    } catch (error) {
        console.error('Error fetching applications:', error);
        res.status(500).json({
            success: false,
            message: 'Error fetching applications'
        });
    }
});

module.exports = router; 
