import * as React from 'react';
import { ReactMediaRecorder } from "react-media-recorder";

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
}

export default function Recorder() {
  const [analysis, setAnalysis] = React.useState<AnalysisResult | null>(null);
  const [error, setError] = React.useState<string | null>(null);

  const handleStop = async (blobUrl: string, blob: Blob) => {
    try {
      // Create FormData and append the audio blob
      const formData = new FormData();
      formData.append('audio', blob, 'recording.wav');

      // Send to backend for analysis
      const response = await fetch('http://localhost:5000/analyze-speech/process-recording', {
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
