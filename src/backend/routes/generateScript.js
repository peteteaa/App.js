const express = require('express');
const router = express.Router();
const { Configuration, OpenAIApi } = require('openai');

// Initialize OpenAI configuration
const configuration = new Configuration({
    apiKey: process.env.OPENAI_API_KEY,
});
const openai = new OpenAIApi(configuration);

// Add at the top of your file
const ERRORS = {
    INVALID_INPUT: 'Invalid input parameters',
    GENERATION_FAILED: 'Failed to generate script',
    QUALITY_CHECK_FAILED: 'Generated script did not meet quality standards',
    API_ERROR: 'OpenAI API error',
};

router.post('/', async (req, res) => {
    try {
        const { type, topic } = req.body;

        // Validate input
        if (!type || !['casual', 'formal'].includes(type)) {
            return res.status(400).json({ error: "Invalid 'type'. Must be 'casual' or 'formal'." });
        }

        if (!topic || typeof topic !== 'string') {
            return res.status(400).json({ error: "Invalid 'topic'. Must be a non-empty string." });
        }

        const prompt = `Write a ${type} script about ${topic}. Follow these guidelines:
- Keep it between 50-100 words
- For ${type === 'casual' ? 'casual tone: use conversational language, contractions, and everyday examples' : 'formal tone: use professional language, proper terminology, and maintain a structured flow'}
- Include natural pauses and paragraph breaks
- End with a clear conclusion
at the bottom include in parentheses this a sample you say whatever you want

The script should be suitable for speech practice.`;

        const response = await openai.createChatCompletion({
            model: 'gpt-3.5-turbo',
            messages: [
                {
                    role: 'user',
                    content: prompt
                }
            ],
            max_tokens: 500,
            temperature: 0.7,
            top_p: 1,
            n: 1
        });

        const script = response.data.choices[0].message.content.trim();

        const formattedResponse = {
            script: script,
            metadata: {
                type: type,
                topic: topic,
                timestamp: new Date().toISOString(),
                wordCount: script.split(' ').length
            }
        };

        res.json(formattedResponse);
    } catch (error) {
        if (error.response) {
            console.error('OpenAI API Error:', error.response.status);
            console.error(error.response.data);

            if (error.response.status === 429) {
                return res.status(429).json({
                    error: 'Rate limit exceeded. Please try again later.',
                    retryAfter: error.response.headers['retry-after'] || 60
                });
            }

            res.status(error.response.status).json({
                error: ERRORS.API_ERROR,
                details: error.response.data.error.message
            });
        } else if (error.request) {
            console.error('Network Error:', error.request);
            res.status(503).json({
                error: ERRORS.GENERATION_FAILED,
                details: 'Network error occurred'
            });
        } else {
            console.error('Error:', error.message);
            res.status(500).json({
                error: ERRORS.GENERATION_FAILED,
                details: error.message
            });
        }
    }
});

module.exports = router; 