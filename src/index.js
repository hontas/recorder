import { h, app } from 'hyperapp';

import App, { setDispatch } from './components/app.jsx';
import './styles.css';

const state = {
  error: '',
  recorder: undefined,
  isRecording: false,
  recordings: []
};

app({
  init: state,
  view: App,
  node: document.getElementById('app-root'),
  subscriptions: (s) => console.log('state', s),
  middleware(dispatch) {
    setDispatch(dispatch);
    return dispatch;
  }
});
