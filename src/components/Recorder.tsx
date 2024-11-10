import * as React from 'react';
import { AudioRecorder } from 'react-audio-voice-recorder';

const addAudioElement = (blob: Blob) => {
};

export default function Recorder() {
  return (
   <div>
   <AudioRecorder
      onRecordingComplete={(blob: Blob) => {
        console.log(blob);  
        const url = URL.createObjectURL(blob);
        console.log(`Url: ${url}`);

        const audio = document.createElement("audio");
        audio.src = url;
        audio.controls = true;
        document.body.appendChild(audio);
      }}
      audioTrackConstraints={{
        noiseSuppression: true,
        echoCancellation: true,
	autoGainControl: false,
      }}
      downloadOnSavePress={false}
      downloadFileExtension="webm"
      showVisualizer={true}
    />
    </div>
  );
}
