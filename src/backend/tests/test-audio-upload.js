const fetch = require('node-fetch');
const fs = require('fs');
const FormData = require('form-data');
const path = require('path');

async function testAudioUpload() {
    try {
        const audioPath = path.join(__dirname, 'test.wav');
        const audioFile = fs.readFileSync(audioPath);

        console.log('Audio file size:', audioFile.length, 'bytes');

        const formData = new FormData();
        formData.append('audio', audioFile, {
            filename: 'test.wav',
            contentType: 'audio/wav'
        });

        console.log('Sending request to server...');
        const response = await fetch('http://localhost:5000/analyze-speech/process-recording', {
            method: 'POST',
            body: formData,
            headers: {
                ...formData.getHeaders()
            }
        });

        if (!response.ok) {
            const errorText = await response.text();
            console.error('Server responded with status:', response.status);
            console.error('Error details:', errorText);
            return;
        }

        const result = await response.json();
        console.log('Response:', JSON.stringify(result, null, 2));

    } catch (error) {
        console.error('Test failed:', error);
    }
}

testAudioUpload(); 