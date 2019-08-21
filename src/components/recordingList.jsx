import { h } from 'hyperapp';

import styles from './recordingList.css';

const RecordingList = ({ recordings }) => {
  return (
    <div className={styles.list}>
      {recordings.map(({ url, timestamp }) => (
        <ListItem url={url} createdAt={timestamp} />
      ))}
    </div>
  );
};

const ListItem = ({ url, createdAt }) => (
  <div className={`${styles.list} ${styles.listItem}`}>
    <span>{getTime(createdAt)}</span>
    <audio src={url} controls className={styles.audio} />
    <a
      href={url}
      download={`recording-${new Date(createdAt).toLocaleString()}.webm`}
    >
      Download
    </a>
  </div>
);

const timeFormatter = new Intl.DateTimeFormat('sv-SE', {
  hour: '2-digit',
  minute: '2-digit'
});
function getTime(timestamp) {
  return timeFormatter.format(timestamp);
}

export default RecordingList;
