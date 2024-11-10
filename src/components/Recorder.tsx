import * as React from 'react';
import { ReactMediaRecorder } from "react-media-recorder";

export default function Recorder() {
  return (
   <div>
   <ReactMediaRecorder
     audio
     onStop={ async (blobUrl, blob) => {
     }}
     render={({ status, startRecording, stopRecording, mediaBlobUrl }) => (
        <div>
          <p>{status}</p>
          <button onClick={startRecording}>Start Recording</button>
          <button onClick={stopRecording}>Stop Recording</button>
	  <audio src={mediaBlobUrl} controls />
        </div>
      )}
    />
    </div>
  );
}
