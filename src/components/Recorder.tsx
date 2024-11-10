import * as React from 'react';
import { ReactMediaRecorder } from "react-media-recorder";
import { SUPPORTED_LANGUAGES, LanguageOption } from '../shared/constants';

interface AnalysisResult {
  transcriptId: string;
  status: string;
  text: string;
  analysis: {
    transcription: string;
    disfluencies: Array<{
      word: string;
      start_time: number;
      end_time: number;
      type: string;
    }>;
  };
  confidence: number;
  feedback: string;
  language: string;
}

export default function Recorder() {
  const [analysis, setAnalysis] = React.useState<AnalysisResult | null>(null);
  const [error, setError] = React.useState<string | null>(null);
  const [selectedLanguage, setSelectedLanguage] = React.useState<string>('en');

  const API_URL = process.env.NODE_ENV === 'production'
    ? '' // Empty string for relative path in production
    : 'http://localhost:5000';

  const handleStop = async (blobUrl: string, blob: Blob) => {
    try {
      const formData = new FormData();
      formData.append('audio', blob, 'recording.wav');
      formData.append('language', selectedLanguage);

      console.log('Sending audio with language:', selectedLanguage);

      const response = await fetch(`${API_URL}/analyze-speech/process-recording`, {
        method: 'POST',
        body: formData
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const data = await response.json();
      console.log('Speech analysis result:', data);
      setAnalysis(data);
      setError(null);
    } catch (error) {
      console.error('Error analyzing speech:', error);
      if (error instanceof Error) {
        setError(error.message);
      } else {
        setError('An unknown error occurred');
      }
    }
  };

  return (
    <div>
      <select className="language-selector"
        value={selectedLanguage}
        onChange={(e) => {
          console.log('Language selected:', e.target.value);
          setSelectedLanguage(e.target.value);
        }}
      >
        {SUPPORTED_LANGUAGES.map(lang => (
          <option key={lang.code} value={lang.code}>
            {lang.name}
          </option>
        ))}
      </select>
      <ReactMediaRecorder

        audio
        onStop={handleStop}
        render={({ status, startRecording, stopRecording, mediaBlobUrl }) => (
          <div>


            <audio src={mediaBlobUrl} controls />
            <button onClick={startRecording}>Start Recording</button>
            <button onClick={stopRecording}>Stop Recording</button>
            {error && <p style={{ color: 'red' }}>{error}</p>}
            {analysis && (
              <div className="analysis-results">
                <h3>Speech Analysis</h3>
                <div className="feedback-section">
                  <h4>Coach Feedback:</h4>
                  <div className="feedback-content">
                    {analysis.feedback?.split('\n').map((paragraph, index) => (
                      <p key={index}>{paragraph}</p>
                    ))}
                  </div>
                </div>
                <details>
                  <summary>Technical Details</summary>
                  <div className="technical-details">
                    <pre>{JSON.stringify(analysis, null, 2)}</pre>
                  </div>
                </details>
              </div>
            )}
          </div>
        )}
      />
    </div>
  );
}
