// Gemini AI Service for AGRO-SMART Chatbot
// This service integrates with Google's Gemini AI for enhanced chatbot responses

const { GoogleGenerativeAI } = require('@google/generative-ai');

class GeminiService {
    constructor() {
        // Configure Gemini API
        // Add your Gemini API key to the .env file: GEMINI_API_KEY=your_api_key_here
        this.apiKey = process.env.GEMINI_API_KEY;
        this.genAI = null;
        this.model = null;
        this.lastRequestTime = 0;
        this.requestCount = 0;
        this.maxRequestsPerMinute = 10; // Conservative limit
        this.rateLimitWindow = 60000; // 1 minute in milliseconds
        
        if (this.apiKey) {
            this.initializeGemini();
        } else {
            console.warn('Gemini API key not found. Chatbot will not function without API key.');
        }
    }

    initializeGemini() {
        try {
            this.genAI = new GoogleGenerativeAI(this.apiKey);
            this.model = this.genAI.getGenerativeModel({ model: "gemini-2.5-pro" });
            console.log('Gemini AI initialized successfully');
        } catch (error) {
            console.error('Failed to initialize Gemini AI:', error);
        }
    }

    // Check rate limiting
    isRateLimited() {
        const now = Date.now();
        
        // Reset counter if window has passed
        if (now - this.lastRequestTime > this.rateLimitWindow) {
            this.requestCount = 0;
            this.lastRequestTime = now;
        }
        
        // Check if we've exceeded the limit
        if (this.requestCount >= this.maxRequestsPerMinute) {
            return true;
        }
        
        return false;
    }

    async generateResponse(message, context = 'agro-smart') {
        if (!this.model) {
            return {
                success: false,
                message: 'Chatbot is not available. Please configure Gemini API key in environment variables.',
                error: 'GEMINI_NOT_CONFIGURED'
            };
        }

        // Check rate limiting
        if (this.isRateLimited()) {
            return {
                success: false,
                message: 'Chatbot is temporarily busy. Please try again in a moment.',
                error: 'RATE_LIMITED'
            };
        }

        try {
            this.requestCount++;
            const prompt = this.buildPrompt(message, context);
            const result = await this.model.generateContent(prompt);
            const response = await result.response;
            return {
                success: true,
                message: response.text(),
                source: 'gemini'
            };
        } catch (error) {
            console.error('Gemini API error:', error);
            
            // Handle specific error types
            if (error.message && error.message.includes('429')) {
                console.warn('Gemini API quota exceeded. Temporarily reducing rate limit.');
                // Increase rate limiting temporarily
                this.maxRequestsPerMinute = 1;
                setTimeout(() => {
                    this.maxRequestsPerMinute = 10;
                }, 300000); // 5 minutes
                
                return {
                    success: false,
                    message: 'Chatbot quota exceeded. Please try again later.',
                    error: 'QUOTA_EXCEEDED'
                };
            }
            
            return {
                success: false,
                message: 'Sorry, I encountered an error. Please try again.',
                error: 'API_ERROR'
            };
        }
    }

    buildPrompt(message, context) {
        // Detect if the message is in Tamil
        const isTamil = this.detectTamilLanguage(message);
        
        const languageInstruction = isTamil 
            ? "IMPORTANT: The user is speaking in Tamil. Please respond in Tamil language. If you cannot respond in Tamil, respond in English."
            : "IMPORTANT: The user is speaking in English. Please respond in English language.";

        const basePrompt = `You are AGRO-SMART, an AI assistant for an agricultural e-commerce platform that connects farmers directly with consumers. 

${languageInstruction}

Context: ${context}

User message: ${message}

Please provide a helpful, informative response that:
1. Is relevant to agriculture, farming, or the AGRO-SMART platform
2. Is conversational and friendly
3. Provides practical advice or information
4. Encourages engagement with the platform
5. Keeps responses concise (2-3 sentences maximum)
6. Responds in the same language as the user's message (Tamil or English)

If the question is not related to agriculture, farming, or our platform, politely redirect the conversation to relevant topics.

Important information about our platform:
- We offer fresh, organic products including vegetables, fruits, dairy, and herbs
- Minimum order amount is ₹42 (approximately $0.50)
- We accept all major credit cards through secure payment processing
- Delivery typically takes 1-3 business days
- Farmers can easily list their products and manage inventory
- All products are sourced directly from local farmers

${isTamil ? 'நீங்கள் தமிழில் பதிலளிக்க வேண்டும்.' : 'Please respond in English.'}`;

        return basePrompt;
    }

    // Detect if the message contains Tamil characters
    detectTamilLanguage(message) {
        // Tamil Unicode range: 0B80-0BFF
        const tamilRegex = /[\u0B80-\u0BFF]/;
        return tamilRegex.test(message);
    }

    isAvailable() {
        return !!this.model;
    }

    getStatus() {
        return {
            available: this.isAvailable(),
            rateLimited: this.isRateLimited(),
            requestCount: this.requestCount,
            maxRequestsPerMinute: this.maxRequestsPerMinute,
            configured: !!this.apiKey
        };
    }
}

module.exports = new GeminiService(); 