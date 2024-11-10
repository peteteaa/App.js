require('dotenv').config();
const express = require('express');
const cors = require('cors');
const path = require('path');
const analyzeSpeechRouter = require('./routes/analyzeSpeech');
const analyzeToneRouter = require('./routes/analyzeTone');
const generateScriptRouter = require('./routes/generateScript');
const { AssemblyAI } = require('assemblyai');

const app = express();

// Middleware
app.use(cors());
app.use(express.json());
app.use(express.static('public'));
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

// Initialize AssemblyAI client
const initializeClient = () => {
    if (!process.env.ASSEMBLYAI_API_KEY) {
        throw new Error('AssemblyAI API key not found');
    }
    return new AssemblyAI({
        apiKey: process.env.ASSEMBLYAI_API_KEY
    });
};

// Routes
app.use('/analyze-speech', analyzeSpeechRouter);
app.use('/analyze-tone', analyzeToneRouter);
app.use('/generate-script', generateScriptRouter);

// Health check endpoint
app.get('/health', (req, res) => {
    const client = new AssemblyAI({
        apiKey: process.env.ASSEMBLYAI_API_KEY
    });

    res.json({
        status: 'ok',
        services: {
            assemblyAI: !!process.env.ASSEMBLYAI_API_KEY,
            openAI: !!process.env.OPENAI_API_KEY,
            ibmWatson: !!process.env.IBM_WATSON_API_KEY
        },
        assemblyAIVersion: client.version
    });
});

// Error handling middleware
app.use((err, req, res, next) => {
    console.error(err.stack);
    res.status(500).json({
        error: 'Something broke!',
        details: err.message
    });
});

// Start server
const PORT = process.env.PORT || 5000;

function startServer(port) {
    app.listen(port, () => {
        console.log(`Server running on port ${port}`);
    }).on('error', (err) => {
        if (err.code === 'EADDRINUSE') {
            console.log(`Port ${port} is busy, trying ${port + 1}...`);
            startServer(port + 1);
        } else {
            console.error('Server error:', err);
        }
    });
}

startServer(PORT);

module.exports = app; 