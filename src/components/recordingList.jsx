import { h } from 'hyperapp';

import Spinner from './spinner.jsx';
import styles from './recordingList.css';

const RecordingList = ({ recordings, updateRecording }) => {
  return (
    <div className={styles.list}>
      {recordings.map((recording) => (
        <Recording recording={recording} updateRecording={updateRecording} />
      ))}
    </div>
  );
};

const Recording = ({ recording, updateRecording }) => {
  const { url, createdAt, exportUrl, isExporting } = recording;
  const duration = 0.01;
  let audioEl;
  let context;
  let gainNode;
  let panNode;
  let bassNode;
  let midNode;
  let trebleNode;

  const handleOnCreate = (event) => {
    context = new AudioContext();
    audioEl = event.target;

    const track = context.createMediaElementSource(audioEl);

    gainNode = context.createGain();

    panNode = new StereoPannerNode(context, { pan: 0 });

    bassNode = context.createBiquadFilter();
    bassNode.type = 'lowshelf';
    bassNode.frequency.setValueAtTime(500, context.currentTime);

    midNode = context.createBiquadFilter();
    midNode.type = 'peaking';
    midNode.Q.setValueAtTime(Math.SQRT1_2, context.currentTime);
    midNode.frequency.setValueAtTime(1500, context.currentTime);

    trebleNode = context.createBiquadFilter();
    trebleNode.type = 'highshelf';
    trebleNode.frequency.setValueAtTime(3000, context.currentTime);

    track
      .connect(gainNode)
      .connect(bassNode)
      .connect(midNode)
      .connect(trebleNode)
      .connect(panNode)
      .connect(context.destination);
  };

  const exportWithEffects = (evt) => {
    evt.preventDefault();
    updateRecording({ ...recording, isExporting: true });
    let chunks = [];
    const destination = context.createMediaStreamDestination();
    const mediaRecorder = new MediaRecorder(destination.stream);

    panNode.disconnect(context.destination);
    panNode.connect(destination);

    audioEl.pause();
    audioEl.loop = false;
    audioEl.currentTime = 0;

    mediaRecorder.addEventListener('dataavailable', (event) => {
      if (typeof event.data === 'undefined') return;
      if (event.data.size === 0) return;
      chunks.push(event.data);
    });

    audioEl.addEventListener('ended', function handleEnded() {
      audioEl.removeEventListener('ended', handleEnded);
      mediaRecorder.stop();
    });

    mediaRecorder.addEventListener('stop', () => {
      const blob = new Blob(chunks, { type: 'audio/webm' });
      const blobUrl = URL.createObjectURL(blob);

      chunks = [];
      panNode.disconnect(destination);
      panNode.connect(context.destination);

      updateRecording({ ...recording, exportUrl: blobUrl, isExporting: false });
    });

    mediaRecorder.start();
    audioEl.play();
  };

  const handleGain = (event) => {
    gainNode.gain.setTargetAtTime(
      Number(event.target.value),
      context.currentTime,
      duration
    );
  };

  const handlePan = (event) => {
    panNode.pan.setTargetAtTime(
      Number(event.target.value),
      context.currentTime,
      duration
    );
  };

  const handleBass = (event) => {
    bassNode.gain.setTargetAtTime(
      Number(event.target.value),
      context.currentTime,
      duration
    );
  };

  const handleMid = (event) => {
    midNode.gain.setTargetAtTime(
      Number(event.target.value),
      context.currentTime,
      duration
    );
  };

  const handleTreble = (event) => {
    trebleNode.gain.setTargetAtTime(
      Number(event.target.value),
      context.currentTime,
      duration
    );
  };

  const toggleLoop = ({ target }) => {
    audioEl.loop = target.checked;
  };

  const skipState = (fn) => (state, event) => {
    fn(event);
    return state;
  };

  const controls = {
    gain: {
      min: 0,
      max: 10,
      step: 0.5,
      value: 1,
      onInput: handleGain
    },
    pan: {
      min: -1,
      max: 1,
      step: 0.1,
      value: 0,
      onInput: handlePan
    },
    bass: {
      min: -50,
      max: 50,
      step: 0.5,
      value: 0,
      onInput: handleBass
    },
    mid: {
      min: -50,
      max: 50,
      step: 0.5,
      value: 0,
      onInput: handleMid
    },
    treble: {
      min: -50,
      max: 50,
      step: 0.5,
      value: 0,
      onInput: handleTreble
    }
  };

  return (
    <div className={styles.list}>
      <div className={styles.row}>
        {/* <span>{getTime(createdAt)}</span> */}

        <audio src={url} controls onloadeddata={skipState(handleOnCreate)} />

        <label>
          <input type="checkbox" onChange={skipState(toggleLoop)} />
          Loop
        </label>

        {/* <a
          href={url}
          download={`recording-${new Date(createdAt).toLocaleString()}.webm`}
        >
          Download
        </a> */}

        {exportUrl ? (
          <a
            href={exportUrl}
            download={`recording-exported-${new Date(
              createdAt
            ).toLocaleString()}.webm`}
          >
            Download
          </a>
        ) : (
          <a href="#" onClick={skipState(exportWithEffects)}>
            Apply effects
          </a>
        )}

        {isExporting && <Spinner />}
      </div>

      <div className={styles.row}>
        {Object.entries(controls).map(
          ([name, { min, max, step, value, onInput }]) => (
            <Slider
              name={name}
              min={min}
              max={max}
              step={step}
              value={value}
              onInput={skipState(onInput)}
            />
          )
        )}
      </div>
    </div>
  );
};

const Slider = ({ name, min, max, step, value, onInput }) => (
  <div className={styles.sliderContainer}>
    <p>{name}</p>
    <div className={styles.slider}>
      <span>{min}</span>
      <input
        className={styles.sliderEl}
        type="range"
        min={min}
        max={max}
        step={step}
        value={value}
        oninput={onInput}
      />
      <span>{max}</span>
    </div>
  </div>
);

// const timeFormatter = new Intl.DateTimeFormat('sv-SE', {
//   hour: '2-digit',
//   minute: '2-digit'
// });
// function getTime(timestamp) {
//   return timeFormatter.format(timestamp);
// }

export default RecordingList;
