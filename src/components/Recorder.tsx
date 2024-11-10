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

  const getServerUrl = async () => {
    for (let port = 5000; port <= 5010; port++) {
      try {
        const response = await fetch(`http://localhost:${port}/health`);
        if (response.ok) {
          return `http://localhost:${port}`;
        }
      } catch (e) {
        continue;
      }
    }
    throw new Error('Could not find server');
  };

  const handleStop = async (blobUrl: string, blob: Blob) => {
    try {
      const serverUrl = await getServerUrl();
      const formData = new FormData();
      formData.append('audio', blob, 'recording.wav');
      formData.append('language', selectedLanguage);

      console.log('Sending audio with language:', selectedLanguage);

      const response = await fetch(`${serverUrl}/analyze-speech/process-recording`, {
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
      <select
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
            <p>{status}</p>
            <button onClick={startRecording}>Start Recording</button>
            <button onClick={stopRecording}>Stop Recording</button>
            <audio src={mediaBlobUrl} controls />
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
