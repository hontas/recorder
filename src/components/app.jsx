import { h } from 'hyperapp';

import Button from './button.jsx';
import RecordingList from './recordingList.jsx';

import styles from './app.css';

let setState;
export function setDispatch(fn) {
  setState = fn;
}
function mergeState(partial) {
  setState((state) => ({ ...state, ...partial }));
}

const App = ({ error, recorder, isRecording, recordings }) => {
  const getMic = (state) => {
    getUserMedia();
    return state;
  };

  const toggleRecording = (state) => {
    if (state.isRecording) {
      recorder.stop();
      return { ...state, isRecording: false };
    }
    recorder.start();
    return { ...state, isRecording: true };
  };

  const recordButtonText = isRecording ? 'Stop recording' : 'Start recording';

  return (
    <div className={styles.app}>
      <h1>Media Recorder</h1>

      {error && <h3>{error}</h3>}

      {recorder ? (
        <Button isActive={isRecording} onClick={toggleRecording}>
          {recordButtonText}
        </Button>
      ) : (
        <Button onClick={getMic}>Get user media</Button>
      )}

      <RecordingList recordings={recordings} />
    </div>
  );
};

export default App;

function getUserMedia() {
  return navigator.mediaDevices
    .getUserMedia({
      audio: true,
      video: false
    })
    .then(setupForRecording)
    .catch(() => {
      mergeState({
        error: 'You denied access to the microphone so this demo will not work.'
      });
    });
}

function setupForRecording(stream) {
  const mimeType = 'audio/webm';
  const recRef = new MediaRecorder(stream, { type: mimeType });
  mergeState({ recorder: recRef });

  let chunks = [];

  recRef.addEventListener('dataavailable', (event) => {
    if (typeof event.data === 'undefined') return;
    if (event.data.size === 0) return;
    chunks.push(event.data);
  });

  recRef.addEventListener('stop', () => {
    const blob = new Blob(chunks, { type: mimeType });
    const newRecording = {
      url: URL.createObjectURL(blob),
      timestamp: Date.now()
    };
    chunks = [];

    setState((state) => ({
      ...state,
      recordings: state.recordings
        ? [...state.recordings, newRecording]
        : [newRecording]
    }));
  });
}
