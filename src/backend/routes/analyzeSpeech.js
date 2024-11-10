const express = require('express');
const router = express.Router();
const axios = require('axios'); // Import axios
const { AssemblyAI } = require('assemblyai');
const { analyzeTone } = require('../services/toneAnalyzer');
const multer = require('multer');
const upload = multer({ storage: multer.memoryStorage() });

// Enhanced error types
class AnalysisError extends Error {
    constructor(message, type, details = {}) {
        super(message);
        this.type = type;
        this.details = details;
    }
}

// Validation function
const validateAudioUrl = (url) => {
    if (!url || typeof url !== 'string') {
        throw new AnalysisError(
            'Invalid audio URL',
            'VALIDATION_ERROR',
            { provided: typeof url }
        );
    }
    try {
        new URL(url);
    } catch {
        throw new AnalysisError(
            'Malformed URL',
            'VALIDATION_ERROR',
            { url }
        );
    }
};

// Initialize AssemblyAI client
const initializeClient = () => {
    if (!process.env.ASSEMBLYAI_API_KEY) {
        throw new Error('AssemblyAI API key not found');
    }
    return new AssemblyAI({
        apiKey: process.env.ASSEMBLYAI_API_KEY
    });
};

// Define the speech analysis function with error handling
function analyzeSpeech(words) {
    try {
        // Validate input
        if (!Array.isArray(words)) {
            console.error('Invalid input: words must be an array');
            return { transcription: '', disfluencies: [] };
        }

        const fillerPhrases = [
            "you know", "i mean", "sort of", "kind of", "you see",
            "basically", "actually", "literally", "like basically"
        ];

        const fillerWords = [
            "um", "uh", "er", "ah", "like", "well", "so", "right",
            "okay", "yeah", "mhm", "hmm"
        ];

        // New: Stutter patterns
        const stutterPatterns = {
            soundRepetition: /^([a-z])\1+/i,  // Detects repeated sounds like "s-s-sorry"
            wordRepetition: /^(\w+)\s+\1$/i,  // Detects repeated words like "the the"
            syllableRepetition: /^([a-z]{1,3})-\1/i  // Detects repeated syllables like "ta-ta"
        };

        // New: Helper function to detect stutters
        const detectStutter = (current, next, prev) => {
            if (!current?.text) return null;

            const currentWord = current.text.toLowerCase();
            const nextWord = next?.text?.toLowerCase();
            const prevWord = prev?.text?.toLowerCase();

            // Check for word repetition
            if (currentWord === prevWord) {
                return {
                    word: `${currentWord} ${currentWord}`,
                    start_time: Math.round((prev.start / 1000) * 10) / 10,
                    end_time: Math.round((current.end / 1000) * 10) / 10,
                    type: "word repetition",
                    severity: "moderate"
                };
            }

            // Check for sound blocks (when confidence is lower)
            if (current.confidence < 0.75 && stutterPatterns.soundRepetition.test(currentWord)) {
                return {
                    word: currentWord,
                    start_time: Math.round((current.start / 1000) * 10) / 10,
                    end_time: Math.round((current.end / 1000) * 10) / 10,
                    type: "sound block",
                    severity: "high"
                };
            }

            return null;
        };

        let transcription = "";
        const disfluencies = [];
        const n = words.length;

        // Helper function to clean word text
        const cleanText = (text) => {
            try {
                // Improved text cleaning
                return text.replace(/[.,!?;:]+$/, '')
                    .replace(/^[.,!?;:]+/, '')
                    .toLowerCase()
                    .trim();
            } catch (error) {
                console.error('Error cleaning text:', error);
                return text ? text.toLowerCase().trim() : '';
            }
        };

        // Build transcription with improved spacing
        for (let i = 0; i < n; i++) {
            try {
                const currentWord = words[i]?.text || '';
                const previousWord = i > 0 ? (words[i - 1]?.text || '') : "";

                // Improved spacing around punctuation
                if (/^[.,!?;:]+/.test(currentWord)) {
                    transcription += currentWord;
                } else if (i === 0) {
                    transcription += currentWord;
                } else {
                    transcription += /[.,!?;:]+$/.test(previousWord) ? ' ' + currentWord : ' ' + currentWord;
                }
            } catch (error) {
                console.error('Error building transcription at index', i, ':', error);
                continue;
            }
        }

        // Detect disfluencies with error handling
        let i = 0;
        while (i < n) {
            try {
                let matched = false;

                // Check for filler phrases
                for (const phrase of fillerPhrases) {
                    const phraseWords = phrase.split(' ');
                    const phraseLength = phraseWords.length;

                    if (i + phraseLength <= n) {
                        let isMatch = true;
                        for (let j = 0; j < phraseLength; j++) {
                            const word = words[i + j];
                            if (!word || !word.text) {
                                isMatch = false;
                                break;
                            }
                            const wordText = cleanText(word.text.replace(/,$/, '')); // Remove trailing comma

                            if (wordText !== phraseWords[j]) {
                                isMatch = false;
                                break;
                            }
                        }

                        if (isMatch) {
                            const startWord = words[i];
                            const endWord = words[i + phraseLength - 1];

                            if (startWord?.start != null && endWord?.end != null) {
                                disfluencies.push({
                                    word: phrase,
                                    start_time: Math.round((startWord.start / 1000) * 10) / 10,
                                    end_time: Math.round((endWord.end / 1000) * 10) / 10,
                                    type: "filler phrase"
                                });
                            }
                            i += phraseLength;
                            matched = true;
                            break;
                        }
                    }
                }

                if (!matched) {
                    const word = words[i];
                    const nextWord = i < n - 1 ? words[i + 1] : null;
                    const prevWord = i > 0 ? words[i - 1] : null;

                    // Check for stutters first
                    const stutterResult = detectStutter(word, nextWord, prevWord);
                    if (stutterResult) {
                        disfluencies.push(stutterResult);
                        i++;
                        continue;
                    }

                    if (word && word.text) {
                        const currentWordClean = cleanText(word.text.replace(/,$/, '')); // Remove trailing comma

                        if (fillerWords.includes(currentWordClean)) {
                            if (currentWordClean === "like") {
                                const confidenceThreshold = 0.8;
                                if (word.confidence < confidenceThreshold) {
                                    if (word.start != null && word.end != null) {
                                        disfluencies.push({
                                            word: currentWordClean,
                                            start_time: Math.round((word.start / 1000) * 10) / 10,
                                            end_time: Math.round((word.end / 1000) * 10) / 10,
                                            type: "filler word"
                                        });
                                    }
                                }
                            } else {
                                if (word.start != null && word.end != null) {
                                    disfluencies.push({
                                        word: currentWordClean,
                                        start_time: Math.round((word.start / 1000) * 10) / 10,
                                        end_time: Math.round((word.end / 1000) * 10) / 10,
                                        type: "filler word"
                                    });
                                }
                            }
                        }
                    }
                    i++;
                }
            } catch (error) {
                console.error('Error processing word at index', i, ':', error);
                i++;
            }
        }

        return {
            transcription: transcription || '',
            disfluencies: disfluencies || []
        };
    } catch (error) {
        console.error('Error in analyzeSpeech:', error);
        return {
            transcription: '',
            disfluencies: []
        };
    }
}

// Add this route for testing stutter detection
router.post('/test-stutter', async (req, res) => {
    try {
        const testWords = [
            { text: 'I', start: 0, end: 100, confidence: 0.9 },
            { text: 'I', start: 150, end: 250, confidence: 0.9 },
            { text: 'w-want', start: 400, end: 500, confidence: 0.7 },
            { text: 'to', start: 800, end: 900, confidence: 0.95 },
            { text: 'like', start: 1000, end: 1100, confidence: 0.6 },
            { text: 'um', start: 1200, end: 1300, confidence: 0.9 },
            { text: 'speak', start: 1500, end: 1600, confidence: 0.95 }
        ];

        const result = analyzeSpeech(testWords);
        res.json({
            analysis: result,
            visualData: {
                words: testWords,
                disfluencies: result.disfluencies,
                statistics: result.statistics
            }
        });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

// Add the new route handler for processing recordings
router.post('/process-recording', upload.single('audio'), async (req, res) => {
    try {
        if (!req.file) {
            throw new AnalysisError(
                'No audio file provided',
                'VALIDATION_ERROR',
                { provided: 'no file' }
            );
        }

        console.log('Received audio file:', {
            size: req.file.size,
            mimetype: req.file.mimetype,
            originalname: req.file.originalname
        });

        const client = initializeClient();

        try {
            // Upload the audio buffer manually using axios
            const uploadResponse = await axios.post('https://api.assemblyai.com/v2/upload', req.file.buffer, {
                headers: {
                    'authorization': process.env.ASSEMBLYAI_API_KEY,
                    'content-type': 'audio/wav'
                }
            });
            console.log('Upload successful:', uploadResponse.data);

            // Create transcript using the uploaded URL
            const transcript = await client.transcripts.create({
                audio_url: uploadResponse.data.upload_url,
                language_code: 'en',
                format_text: true
            });

            console.log('Transcript created:', transcript);

            // Poll for completion
            let result = await client.transcripts.get(transcript.id);
            while (result.status !== 'completed' && result.status !== 'error') {
                await new Promise(resolve => setTimeout(resolve, 1000));
                result = await client.transcripts.get(transcript.id);
                console.log('Transcript status:', result.status);
            }

            if (result.status === 'error') {
                throw new AnalysisError(
                    'Transcription failed',
                    'PROCESSING_ERROR',
                    { transcriptId: transcript.id }
                );
            }

            // Use your existing analyzeSpeech function
            const analysis = analyzeSpeech(result.words || []);

            res.json({
                transcriptId: transcript.id,
                status: result.status,
                text: result.text,
                analysis: analysis,
                confidence: result.confidence
            });

        } catch (uploadError) {
            console.error('Upload/Transcription error:', uploadError.response?.data || uploadError.message);
            throw new AnalysisError(
                'Failed to process audio',
                'UPLOAD_ERROR',
                { details: uploadError.response?.data || uploadError.message }
            );
        }

    } catch (error) {
        console.error('Speech analysis error:', error);
        const statusCode = {
            VALIDATION_ERROR: 400,
            TRANSCRIPTION_ERROR: 500,
            TIMEOUT_ERROR: 504
        }[error.type] || 500;

        return res.status(statusCode).json({
            error: error.message,
            type: error.type,
            details: error.details
        });
    }
});

module.exports = router;
