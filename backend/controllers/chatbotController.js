const axios = require('axios');

exports.askGemini = async (req, res) => {
    const { prompt } = req.body;
    if (!prompt) {
        return res.status(400).json({ success: false, message: 'Prompt is required' });
    }
    try {
        const apiKey = process.env.GEMINI_API_KEY;
        const url = `https://generativelanguage.googleapis.com/v1beta/models/gemini-pro:generateContent?key=${apiKey}`;
        const response = await axios.post(url, {
            contents: [{ parts: [{ text: prompt }] }]
        });
        const geminiReply = response.data.candidates?.[0]?.content?.parts?.[0]?.text || "No response from Gemini.";
        res.json({ success: true, reply: geminiReply });
    } catch (error) {
        console.error('Gemini API error:', error.response?.data || error.message);
        res.status(500).json({ success: false, message: "Gemini API error" });
    }
};