const express = require('express');
const serverless = require('serverless-http');
const path = require('path');

const app = express();
const router = express.Router();

// Serve frontend static files
app.use(express.static(path.join(__dirname, '../frontend')));

// Example API route
router.get('/hello', (req, res) => {
    res.json({ message: 'Hello from API' });
});

app.use('/api', router);

// Fallback to index.html for frontend routes
app.get('*', (req, res) => {
    res.sendFile(path.join(__dirname, '../frontend/index.html'));
});

module.exports = app;
module.exports.handler = serverless(app);
