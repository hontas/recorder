import { h } from 'hyperapp';
import styles from './button.css';

const Button = ({ className, isActive, ...props }, children) => {
  const activeStyle = isActive ? styles.btnActive : '';
  const classNames = `${styles.btn} ${className} ${activeStyle}`;

  return (
    <button className={classNames} {...props}>
      {children}
    </button>
  );
};

export default Button;
