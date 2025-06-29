const express = require('express');
const router = express.Router();
const geminiService = require('../services/geminiService');

// Chatbot endpoint for AI responses
router.post('/chat', async (req, res) => {
    try {
        const { message, context = 'agro-smart' } = req.body;
        
        if (!message || typeof message !== 'string') {
            return res.status(400).json({
                success: false,
                message: 'Message is required and must be a string'
            });
        }

        // Detect language
        const isTamil = geminiService.detectTamilLanguage ? geminiService.detectTamilLanguage(message) : false;

        // Generate response using Gemini AI
        const result = await geminiService.generateResponse(message, context);
        
        if (result.success) {
            res.json({
                success: true,
                response: result.message,
                aiProvider: 'Gemini AI',
                source: result.source,
                detectedLanguage: isTamil ? 'Tamil' : 'English',
                responseLanguage: isTamil ? 'Tamil' : 'English'
            });
        } else {
            res.status(503).json({
                success: false,
                message: result.message,
                error: result.error,
                aiProvider: 'Gemini AI',
                detectedLanguage: isTamil ? 'Tamil' : 'English'
            });
        }
    } catch (error) {
        console.error('Chatbot error:', error);
        res.status(500).json({
            success: false,
            message: 'Error generating response',
            error: 'INTERNAL_ERROR'
        });
    }
});

// Get chatbot status
router.get('/status', (req, res) => {
    const status = geminiService.getStatus();
    res.json({
        success: true,
        available: status.available,
        configured: status.configured,
        rateLimited: status.rateLimited,
        requestCount: status.requestCount,
        maxRequestsPerMinute: status.maxRequestsPerMinute,
        provider: status.available ? 'Gemini AI' : 'Not Available'
    });
});

module.exports = router; 