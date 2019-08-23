import { h } from 'hyperapp';

import styles from './spinner.css';

export default ({ className, size = 1, thickness = 2 }) => (
  <div
    className={`${styles.spinner} ${className}`}
    style={{
      width: `${size}em`,
      height: `${size}em`,
      borderWidth: `${thickness}px`
    }}
  />
);
