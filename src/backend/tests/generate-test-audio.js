const fs = require('fs');
const path = require('path');

// Create a WAV file with a spoken word
function generateTestAudio() {
    // WAV header for 16-bit PCM, mono, 44.1kHz
    const sampleRate = 44100;
    const duration = 2; // 2 seconds
    const numSamples = sampleRate * duration;

    // Create header
    const header = Buffer.alloc(44);

    // "RIFF" chunk descriptor
    header.write('RIFF', 0);
    header.writeUInt32LE(36 + numSamples * 2, 4);
    header.write('WAVE', 8);

    // "fmt " sub-chunk
    header.write('fmt ', 12);
    header.writeUInt32LE(16, 16);
    header.writeUInt16LE(1, 20);      // PCM format
    header.writeUInt16LE(1, 22);      // Mono channel
    header.writeUInt32LE(sampleRate, 24);
    header.writeUInt32LE(sampleRate * 2, 28);
    header.writeUInt16LE(2, 32);
    header.writeUInt16LE(16, 34);

    // "data" sub-chunk
    header.write('data', 36);
    header.writeUInt32LE(numSamples * 2, 40);

    // Generate audio data (440Hz tone)
    const audioData = Buffer.alloc(numSamples * 2);
    for (let i = 0; i < numSamples; i++) {
        // Create a more complex waveform (combination of frequencies)
        const t = i / sampleRate;
        const value = Math.floor(
            32767 * (
                0.5 * Math.sin(2 * Math.PI * 440 * t) +  // 440Hz (A4 note)
                0.3 * Math.sin(2 * Math.PI * 880 * t) +  // First harmonic
                0.2 * Math.sin(2 * Math.PI * 1320 * t)   // Second harmonic
            )
        );
        audioData.writeInt16LE(value, i * 2);
    }

    // Combine header and audio data
    const wavFile = Buffer.concat([header, audioData]);

    // Write to file
    const filePath = path.join(__dirname, 'test.wav');
    fs.writeFileSync(filePath, wavFile);
    console.log(`Created test audio file: ${filePath}`);

    return filePath;
}

generateTestAudio(); 