// modules are defined as an array
// [ module function, map of requires ]
//
// map of requires is short require name -> numeric require
//
// anything defined in a previous bundle is accessed via the
// orig method which is the require for previous bundles
parcelRequire = (function (modules, cache, entry, globalName) {
  // Save the require from previous bundle to this closure if any
  var previousRequire = typeof parcelRequire === 'function' && parcelRequire;
  var nodeRequire = typeof require === 'function' && require;

  function newRequire(name, jumped) {
    if (!cache[name]) {
      if (!modules[name]) {
        // if we cannot find the module within our internal map or
        // cache jump to the current global require ie. the last bundle
        // that was added to the page.
        var currentRequire = typeof parcelRequire === 'function' && parcelRequire;
        if (!jumped && currentRequire) {
          return currentRequire(name, true);
        }

        // If there are other bundles on this page the require from the
        // previous one is saved to 'previousRequire'. Repeat this as
        // many times as there are bundles until the module is found or
        // we exhaust the require chain.
        if (previousRequire) {
          return previousRequire(name, true);
        }

        // Try the node require function if it exists.
        if (nodeRequire && typeof name === 'string') {
          return nodeRequire(name);
        }

        var err = new Error('Cannot find module \'' + name + '\'');
        err.code = 'MODULE_NOT_FOUND';
        throw err;
      }

      localRequire.resolve = resolve;
      localRequire.cache = {};

      var module = cache[name] = new newRequire.Module(name);

      modules[name][0].call(module.exports, localRequire, module, module.exports, this);
    }

    return cache[name].exports;

    function localRequire(x){
      return newRequire(localRequire.resolve(x));
    }

    function resolve(x){
      return modules[name][1][x] || x;
    }
  }

  function Module(moduleName) {
    this.id = moduleName;
    this.bundle = newRequire;
    this.exports = {};
  }

  newRequire.isParcelRequire = true;
  newRequire.Module = Module;
  newRequire.modules = modules;
  newRequire.cache = cache;
  newRequire.parent = previousRequire;
  newRequire.register = function (id, exports) {
    modules[id] = [function (require, module) {
      module.exports = exports;
    }, {}];
  };

  var error;
  for (var i = 0; i < entry.length; i++) {
    try {
      newRequire(entry[i]);
    } catch (e) {
      // Save first error but execute all entries
      if (!error) {
        error = e;
      }
    }
  }

  if (entry.length) {
    // Expose entry point to Node, AMD or browser globals
    // Based on https://github.com/ForbesLindesay/umd/blob/master/template.js
    var mainExports = newRequire(entry[entry.length - 1]);

    // CommonJS
    if (typeof exports === "object" && typeof module !== "undefined") {
      module.exports = mainExports;

    // RequireJS
    } else if (typeof define === "function" && define.amd) {
     define(function () {
       return mainExports;
     });

    // <script>
    } else if (globalName) {
      this[globalName] = mainExports;
    }
  }

  // Override the current require with this new one
  parcelRequire = newRequire;

  if (error) {
    // throw error from earlier, _after updating parcelRequire_
    throw error;
  }

  return newRequire;
})({"node_modules/hyperapp/src/index.js":[function(require,module,exports) {
"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.app = exports.h = exports.Lazy = void 0;
var RECYCLED_NODE = 1;
var LAZY_NODE = 2;
var TEXT_NODE = 3;
var EMPTY_OBJ = {};
var EMPTY_ARR = [];
var map = EMPTY_ARR.map;
var isArray = Array.isArray;
var defer = typeof requestAnimationFrame !== "undefined" ? requestAnimationFrame : setTimeout;

var createClass = function (obj) {
  var out = "";
  if (typeof obj === "string") return obj;

  if (isArray(obj) && obj.length > 0) {
    for (var k = 0, tmp; k < obj.length; k++) {
      if ((tmp = createClass(obj[k])) !== "") {
        out += (out && " ") + tmp;
      }
    }
  } else {
    for (var k in obj) {
      if (obj[k]) {
        out += (out && " ") + k;
      }
    }
  }

  return out;
};

var merge = function (a, b) {
  var out = {};

  for (var k in a) out[k] = a[k];

  for (var k in b) out[k] = b[k];

  return out;
};

var batch = function (list) {
  return list.reduce(function (out, item) {
    return out.concat(!item || item === true ? 0 : typeof item[0] === "function" ? [item] : batch(item));
  }, EMPTY_ARR);
};

var isSameAction = function (a, b) {
  return isArray(a) && isArray(b) && a[0] === b[0] && typeof a[0] === "function";
};

var shouldRestart = function (a, b) {
  if (a !== b) {
    for (var k in merge(a, b)) {
      if (a[k] !== b[k] && !isSameAction(a[k], b[k])) return true;
      b[k] = a[k];
    }
  }
};

var patchSubs = function (oldSubs, newSubs, dispatch) {
  for (var i = 0, oldSub, newSub, subs = []; i < oldSubs.length || i < newSubs.length; i++) {
    oldSub = oldSubs[i];
    newSub = newSubs[i];
    subs.push(newSub ? !oldSub || newSub[0] !== oldSub[0] || shouldRestart(newSub[1], oldSub[1]) ? [newSub[0], newSub[1], newSub[0](dispatch, newSub[1]), oldSub && oldSub[2]()] : oldSub : oldSub && oldSub[2]());
  }

  return subs;
};

var patchProperty = function (node, key, oldValue, newValue, listener, isSvg) {
  if (key === "key") {} else if (key === "style") {
    for (var k in merge(oldValue, newValue)) {
      oldValue = newValue == null || newValue[k] == null ? "" : newValue[k];

      if (k[0] === "-") {
        node[key].setProperty(k, oldValue);
      } else {
        node[key][k] = oldValue;
      }
    }
  } else if (key[0] === "o" && key[1] === "n") {
    if (!((node.actions || (node.actions = {}))[key = key.slice(2).toLowerCase()] = newValue)) {
      node.removeEventListener(key, listener);
    } else if (!oldValue) {
      node.addEventListener(key, listener);
    }
  } else if (!isSvg && key !== "list" && key in node) {
    node[key] = newValue == null ? "" : newValue;
  } else if (newValue == null || newValue === false || key === "class" && !(newValue = createClass(newValue))) {
    node.removeAttribute(key);
  } else {
    node.setAttribute(key, newValue);
  }
};

var createNode = function (vdom, listener, isSvg) {
  var ns = "http://www.w3.org/2000/svg";
  var props = vdom.props;
  var node = vdom.type === TEXT_NODE ? document.createTextNode(vdom.name) : (isSvg = isSvg || vdom.name === "svg") ? document.createElementNS(ns, vdom.name, {
    is: props.is
  }) : document.createElement(vdom.name, {
    is: props.is
  });

  for (var k in props) {
    patchProperty(node, k, null, props[k], listener, isSvg);
  }

  for (var i = 0, len = vdom.children.length; i < len; i++) {
    node.appendChild(createNode(vdom.children[i] = getVNode(vdom.children[i]), listener, isSvg));
  }

  return vdom.node = node;
};

var getKey = function (vdom) {
  return vdom == null ? null : vdom.key;
};

var patch = function (parent, node, oldVNode, newVNode, listener, isSvg) {
  if (oldVNode === newVNode) {} else if (oldVNode != null && oldVNode.type === TEXT_NODE && newVNode.type === TEXT_NODE) {
    if (oldVNode.name !== newVNode.name) node.nodeValue = newVNode.name;
  } else if (oldVNode == null || oldVNode.name !== newVNode.name) {
    node = parent.insertBefore(createNode(newVNode = getVNode(newVNode), listener, isSvg), node);

    if (oldVNode != null) {
      parent.removeChild(oldVNode.node);
    }
  } else {
    var tmpVKid;
    var oldVKid;
    var oldKey;
    var newKey;
    var oldVProps = oldVNode.props;
    var newVProps = newVNode.props;
    var oldVKids = oldVNode.children;
    var newVKids = newVNode.children;
    var oldHead = 0;
    var newHead = 0;
    var oldTail = oldVKids.length - 1;
    var newTail = newVKids.length - 1;
    isSvg = isSvg || newVNode.name === "svg";

    for (var i in merge(oldVProps, newVProps)) {
      if ((i === "value" || i === "selected" || i === "checked" ? node[i] : oldVProps[i]) !== newVProps[i]) {
        patchProperty(node, i, oldVProps[i], newVProps[i], listener, isSvg);
      }
    }

    while (newHead <= newTail && oldHead <= oldTail) {
      if ((oldKey = getKey(oldVKids[oldHead])) == null || oldKey !== getKey(newVKids[newHead])) {
        break;
      }

      patch(node, oldVKids[oldHead].node, oldVKids[oldHead], newVKids[newHead] = getVNode(newVKids[newHead++], oldVKids[oldHead++]), listener, isSvg);
    }

    while (newHead <= newTail && oldHead <= oldTail) {
      if ((oldKey = getKey(oldVKids[oldTail])) == null || oldKey !== getKey(newVKids[newTail])) {
        break;
      }

      patch(node, oldVKids[oldTail].node, oldVKids[oldTail], newVKids[newTail] = getVNode(newVKids[newTail--], oldVKids[oldTail--]), listener, isSvg);
    }

    if (oldHead > oldTail) {
      while (newHead <= newTail) {
        node.insertBefore(createNode(newVKids[newHead] = getVNode(newVKids[newHead++]), listener, isSvg), (oldVKid = oldVKids[oldHead]) && oldVKid.node);
      }
    } else if (newHead > newTail) {
      while (oldHead <= oldTail) {
        node.removeChild(oldVKids[oldHead++].node);
      }
    } else {
      for (var i = oldHead, keyed = {}, newKeyed = {}; i <= oldTail; i++) {
        if ((oldKey = oldVKids[i].key) != null) {
          keyed[oldKey] = oldVKids[i];
        }
      }

      while (newHead <= newTail) {
        oldKey = getKey(oldVKid = oldVKids[oldHead]);
        newKey = getKey(newVKids[newHead] = getVNode(newVKids[newHead], oldVKid));

        if (newKeyed[oldKey] || newKey != null && newKey === getKey(oldVKids[oldHead + 1])) {
          if (oldKey == null) {
            node.removeChild(oldVKid.node);
          }

          oldHead++;
          continue;
        }

        if (newKey == null || oldVNode.type === RECYCLED_NODE) {
          if (oldKey == null) {
            patch(node, oldVKid && oldVKid.node, oldVKid, newVKids[newHead], listener, isSvg);
            newHead++;
          }

          oldHead++;
        } else {
          if (oldKey === newKey) {
            patch(node, oldVKid.node, oldVKid, newVKids[newHead], listener, isSvg);
            newKeyed[newKey] = true;
            oldHead++;
          } else {
            if ((tmpVKid = keyed[newKey]) != null) {
              patch(node, node.insertBefore(tmpVKid.node, oldVKid && oldVKid.node), tmpVKid, newVKids[newHead], listener, isSvg);
              newKeyed[newKey] = true;
            } else {
              patch(node, oldVKid && oldVKid.node, null, newVKids[newHead], listener, isSvg);
            }
          }

          newHead++;
        }
      }

      while (oldHead <= oldTail) {
        if (getKey(oldVKid = oldVKids[oldHead++]) == null) {
          node.removeChild(oldVKid.node);
        }
      }

      for (var i in keyed) {
        if (newKeyed[i] == null) {
          node.removeChild(keyed[i].node);
        }
      }
    }
  }

  return newVNode.node = node;
};

var propsChanged = function (a, b) {
  for (var k in a) if (a[k] !== b[k]) return true;

  for (var k in b) if (a[k] !== b[k]) return true;
};

var getVNode = function (newVNode, oldVNode) {
  return newVNode.type === LAZY_NODE ? ((!oldVNode || propsChanged(oldVNode.lazy, newVNode.lazy)) && ((oldVNode = newVNode.lazy.view(newVNode.lazy)).lazy = newVNode.lazy), oldVNode) : newVNode;
};

var createVNode = function (name, props, children, node, key, type) {
  return {
    name: name,
    props: props,
    children: children,
    node: node,
    type: type,
    key: key
  };
};

var createTextVNode = function (value, node) {
  return createVNode(value, EMPTY_OBJ, EMPTY_ARR, node, undefined, TEXT_NODE);
};

var recycleNode = function (node) {
  return node.nodeType === TEXT_NODE ? createTextVNode(node.nodeValue, node) : createVNode(node.nodeName.toLowerCase(), EMPTY_OBJ, map.call(node.childNodes, recycleNode), node, undefined, RECYCLED_NODE);
};

var Lazy = function (props) {
  return {
    lazy: props,
    type: LAZY_NODE
  };
};

exports.Lazy = Lazy;

var h = function (name, props) {
  for (var vdom, rest = [], children = [], i = arguments.length; i-- > 2;) {
    rest.push(arguments[i]);
  }

  while (rest.length > 0) {
    if (isArray(vdom = rest.pop())) {
      for (var i = vdom.length; i-- > 0;) {
        rest.push(vdom[i]);
      }
    } else if (vdom === false || vdom === true || vdom == null) {} else {
      children.push(typeof vdom === "object" ? vdom : createTextVNode(vdom));
    }
  }

  props = props || EMPTY_OBJ;
  return typeof name === "function" ? name(props, children) : createVNode(name, props, children, undefined, props.key);
};

exports.h = h;

var app = function (props) {
  var state = {};
  var lock = false;
  var view = props.view;
  var node = props.node;
  var vdom = node && recycleNode(node);
  var subscriptions = props.subscriptions;
  var subs = [];

  var listener = function (event) {
    dispatch(this.actions[event.type], event);
  };

  var setState = function (newState) {
    if (state !== newState) {
      state = newState;

      if (subscriptions) {
        subs = patchSubs(subs, batch([subscriptions(state)]), dispatch);
      }

      if (view && !lock) defer(render, lock = true);
    }

    return state;
  };

  var dispatch = (props.middleware || function (obj) {
    return obj;
  })(function (action, props) {
    return typeof action === "function" ? dispatch(action(state, props)) : isArray(action) ? typeof action[0] === "function" ? dispatch(action[0], typeof action[1] === "function" ? action[1](props) : action[1]) : (batch(action.slice(1)).map(function (fx) {
      fx && fx[0](dispatch, fx[1]);
    }, setState(action[0])), state) : setState(action);
  });

  var render = function () {
    lock = false;
    node = patch(node.parentNode, node, vdom, vdom = typeof (vdom = view(state)) === "string" ? createTextVNode(vdom) : vdom, listener);
  };

  dispatch(props.init);
};

exports.app = app;
},{}],"node_modules/parcel-bundler/src/builtins/bundle-url.js":[function(require,module,exports) {
var bundleURL = null;

function getBundleURLCached() {
  if (!bundleURL) {
    bundleURL = getBundleURL();
  }

  return bundleURL;
}

function getBundleURL() {
  // Attempt to find the URL of the current script and use that as the base URL
  try {
    throw new Error();
  } catch (err) {
    var matches = ('' + err.stack).match(/(https?|file|ftp|chrome-extension|moz-extension):\/\/[^)\n]+/g);

    if (matches) {
      return getBaseURL(matches[0]);
    }
  }

  return '/';
}

function getBaseURL(url) {
  return ('' + url).replace(/^((?:https?|file|ftp|chrome-extension|moz-extension):\/\/.+)\/[^/]+$/, '$1') + '/';
}

exports.getBundleURL = getBundleURLCached;
exports.getBaseURL = getBaseURL;
},{}],"node_modules/parcel-bundler/src/builtins/css-loader.js":[function(require,module,exports) {
var bundle = require('./bundle-url');

function updateLink(link) {
  var newLink = link.cloneNode();

  newLink.onload = function () {
    link.remove();
  };

  newLink.href = link.href.split('?')[0] + '?' + Date.now();
  link.parentNode.insertBefore(newLink, link.nextSibling);
}

var cssTimeout = null;

function reloadCSS() {
  if (cssTimeout) {
    return;
  }

  cssTimeout = setTimeout(function () {
    var links = document.querySelectorAll('link[rel="stylesheet"]');

    for (var i = 0; i < links.length; i++) {
      if (bundle.getBaseURL(links[i].href) === bundle.getBundleURL()) {
        updateLink(links[i]);
      }
    }

    cssTimeout = null;
  }, 50);
}

module.exports = reloadCSS;
},{"./bundle-url":"node_modules/parcel-bundler/src/builtins/bundle-url.js"}],"src/components/button.css":[function(require,module,exports) {
var reloadCSS = require('_css_loader');

module.hot.dispose(reloadCSS);
module.hot.accept(reloadCSS);
module.exports = {
  "btn": "_btn_984a1",
  "btnActive": "_btnActive_984a1",
  "pulse": "_pulse_984a1"
};
},{"_css_loader":"node_modules/parcel-bundler/src/builtins/css-loader.js"}],"src/components/button.jsx":[function(require,module,exports) {
"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.default = void 0;

var _hyperapp = require("hyperapp");

var _button = _interopRequireDefault(require("./button.css"));

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

function _extends() { _extends = Object.assign || function (target) { for (var i = 1; i < arguments.length; i++) { var source = arguments[i]; for (var key in source) { if (Object.prototype.hasOwnProperty.call(source, key)) { target[key] = source[key]; } } } return target; }; return _extends.apply(this, arguments); }

const Button = ({
  className,
  isActive,
  ...props
}, children) => {
  const activeStyle = isActive ? _button.default.btnActive : '';
  const classNames = `${_button.default.btn} ${className} ${activeStyle}`;
  return (0, _hyperapp.h)("button", _extends({
    className: classNames
  }, props), children);
};

var _default = Button;
exports.default = _default;
},{"hyperapp":"node_modules/hyperapp/src/index.js","./button.css":"src/components/button.css"}],"src/components/spinner.css":[function(require,module,exports) {
var reloadCSS = require('_css_loader');

module.hot.dispose(reloadCSS);
module.hot.accept(reloadCSS);
module.exports = {
  "spinner": "_spinner_5687f",
  "spin": "_spin_5687f"
};
},{"_css_loader":"node_modules/parcel-bundler/src/builtins/css-loader.js"}],"src/components/spinner.jsx":[function(require,module,exports) {
"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.default = void 0;

var _hyperapp = require("hyperapp");

var _spinner = _interopRequireDefault(require("./spinner.css"));

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

var _default = ({
  className,
  size = 1,
  thickness = 2
}) => (0, _hyperapp.h)("div", {
  className: `${_spinner.default.spinner} ${className}`,
  style: {
    width: `${size}em`,
    height: `${size}em`,
    borderWidth: `${thickness}px`
  }
});

exports.default = _default;
},{"hyperapp":"node_modules/hyperapp/src/index.js","./spinner.css":"src/components/spinner.css"}],"src/components/recordingList.css":[function(require,module,exports) {
var reloadCSS = require('_css_loader');

module.hot.dispose(reloadCSS);
module.hot.accept(reloadCSS);
module.exports = {
  "list": "_list_06052",
  "row": "_row_06052",
  "sliderContainer": "_sliderContainer_06052",
  "slider": "_slider_06052",
  "sliderEl": "_sliderEl_06052"
};
},{"_css_loader":"node_modules/parcel-bundler/src/builtins/css-loader.js"}],"src/components/recordingList.jsx":[function(require,module,exports) {
"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.default = void 0;

var _hyperapp = require("hyperapp");

var _spinner = _interopRequireDefault(require("./spinner.jsx"));

var _recordingList = _interopRequireDefault(require("./recordingList.css"));

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

const RecordingList = ({
  recordings,
  updateRecording
}) => {
  return (0, _hyperapp.h)("div", {
    className: _recordingList.default.list
  }, recordings.map(recording => (0, _hyperapp.h)(Recording, {
    recording: recording,
    updateRecording: updateRecording
  })));
};

const Recording = ({
  recording,
  updateRecording
}) => {
  const {
    url,
    createdAt,
    exportUrl,
    isExporting
  } = recording;
  const duration = 0.01;
  let audioEl;
  let context;
  let gainNode;
  let panNode;
  let bassNode;
  let midNode;
  let trebleNode;

  const handleOnCreate = event => {
    context = new AudioContext();
    audioEl = event.target;
    const track = context.createMediaElementSource(audioEl);
    gainNode = context.createGain();
    panNode = new StereoPannerNode(context, {
      pan: 0
    });
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
    track.connect(gainNode).connect(bassNode).connect(midNode).connect(trebleNode).connect(panNode).connect(context.destination);
  };

  const exportWithEffects = evt => {
    evt.preventDefault();
    updateRecording({ ...recording,
      isExporting: true
    });
    let chunks = [];
    const destination = context.createMediaStreamDestination();
    const mediaRecorder = new MediaRecorder(destination.stream);
    panNode.disconnect(context.destination);
    panNode.connect(destination);
    audioEl.pause();
    audioEl.loop = false;
    audioEl.currentTime = 0;
    mediaRecorder.addEventListener('dataavailable', event => {
      if (typeof event.data === 'undefined') return;
      if (event.data.size === 0) return;
      chunks.push(event.data);
    });
    audioEl.addEventListener('ended', function handleEnded() {
      audioEl.removeEventListener('ended', handleEnded);
      mediaRecorder.stop();
    });
    mediaRecorder.addEventListener('stop', () => {
      const blob = new Blob(chunks, {
        type: 'audio/webm'
      });
      const blobUrl = URL.createObjectURL(blob);
      chunks = [];
      panNode.disconnect(destination);
      panNode.connect(context.destination);
      updateRecording({ ...recording,
        exportUrl: blobUrl,
        isExporting: false
      });
    });
    mediaRecorder.start();
    audioEl.play();
  };

  const handleGain = event => {
    gainNode.gain.setTargetAtTime(Number(event.target.value), context.currentTime, duration);
  };

  const handlePan = event => {
    panNode.pan.setTargetAtTime(Number(event.target.value), context.currentTime, duration);
  };

  const handleBass = event => {
    bassNode.gain.setTargetAtTime(Number(event.target.value), context.currentTime, duration);
  };

  const handleMid = event => {
    midNode.gain.setTargetAtTime(Number(event.target.value), context.currentTime, duration);
  };

  const handleTreble = event => {
    trebleNode.gain.setTargetAtTime(Number(event.target.value), context.currentTime, duration);
  };

  const toggleLoop = ({
    target
  }) => {
    audioEl.loop = target.checked;
  };

  const skipState = fn => (state, event) => {
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
  return (0, _hyperapp.h)("div", {
    className: _recordingList.default.list
  }, (0, _hyperapp.h)("div", {
    className: _recordingList.default.row
  }, (0, _hyperapp.h)("audio", {
    src: url,
    controls: true,
    onloadeddata: skipState(handleOnCreate)
  }), (0, _hyperapp.h)("label", null, (0, _hyperapp.h)("input", {
    type: "checkbox",
    onChange: skipState(toggleLoop)
  }), "Loop"), exportUrl ? (0, _hyperapp.h)("a", {
    href: exportUrl,
    download: `recording-exported-${new Date(createdAt).toLocaleString()}.webm`
  }, "Download") : (0, _hyperapp.h)("a", {
    href: "#",
    onClick: skipState(exportWithEffects)
  }, "Apply effects"), isExporting && (0, _hyperapp.h)(_spinner.default, null)), (0, _hyperapp.h)("div", {
    className: _recordingList.default.row
  }, Object.entries(controls).map(([name, {
    min,
    max,
    step,
    value,
    onInput
  }]) => (0, _hyperapp.h)(Slider, {
    name: name,
    min: min,
    max: max,
    step: step,
    value: value,
    onInput: skipState(onInput)
  }))));
};

const Slider = ({
  name,
  min,
  max,
  step,
  value,
  onInput
}) => (0, _hyperapp.h)("div", {
  className: _recordingList.default.sliderContainer
}, (0, _hyperapp.h)("p", null, name), (0, _hyperapp.h)("div", {
  className: _recordingList.default.slider
}, (0, _hyperapp.h)("span", null, min), (0, _hyperapp.h)("input", {
  className: _recordingList.default.sliderEl,
  type: "range",
  min: min,
  max: max,
  step: step,
  value: value,
  oninput: onInput
}), (0, _hyperapp.h)("span", null, max))); // const timeFormatter = new Intl.DateTimeFormat('sv-SE', {
//   hour: '2-digit',
//   minute: '2-digit'
// });
// function getTime(timestamp) {
//   return timeFormatter.format(timestamp);
// }


var _default = RecordingList;
exports.default = _default;
},{"hyperapp":"node_modules/hyperapp/src/index.js","./spinner.jsx":"src/components/spinner.jsx","./recordingList.css":"src/components/recordingList.css"}],"src/components/app.css":[function(require,module,exports) {
var reloadCSS = require('_css_loader');

module.hot.dispose(reloadCSS);
module.hot.accept(reloadCSS);
module.exports = {
  "app": "_app_1a2c9"
};
},{"_css_loader":"node_modules/parcel-bundler/src/builtins/css-loader.js"}],"src/components/app.jsx":[function(require,module,exports) {
"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.setDispatch = setDispatch;
exports.default = void 0;

var _hyperapp = require("hyperapp");

var _button = _interopRequireDefault(require("./button.jsx"));

var _recordingList = _interopRequireDefault(require("./recordingList.jsx"));

var _app = _interopRequireDefault(require("./app.css"));

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

let setState;

function setDispatch(fn) {
  setState = fn;
}

function mergeState(partial) {
  setState(state => ({ ...state,
    ...partial
  }));
}

const App = ({
  error,
  recorder,
  isRecording,
  recordings
}) => {
  const getMic = state => {
    getUserMedia();
    return state;
  };

  const toggleRecording = state => {
    if (state.isRecording) {
      recorder.stop();
      return { ...state,
        isRecording: false
      };
    }

    recorder.start();
    return { ...state,
      isRecording: true
    };
  };

  const updateRecording = recording => {
    const recordingToUpdate = recordings.find(({
      createdAt
    }) => createdAt === recording.createdAt);
    const index = recordings.indexOf(recordingToUpdate);
    const updatedRecordings = [...recordings.slice(0, index), { ...recording,
      updatedAt: Date.now()
    }, ...recordings.slice(index + 1)];
    mergeState({
      recordings: updatedRecordings
    });
  };

  const recordButtonText = isRecording ? 'Stop recording' : 'Start recording';
  return (0, _hyperapp.h)("div", {
    className: _app.default.app
  }, (0, _hyperapp.h)("h1", null, "Media Recorder"), error && (0, _hyperapp.h)("h3", null, error), recorder ? (0, _hyperapp.h)(_button.default, {
    isActive: isRecording,
    onClick: toggleRecording
  }, recordButtonText) : (0, _hyperapp.h)(_button.default, {
    onClick: getMic
  }, "Get user media"), (0, _hyperapp.h)(_recordingList.default, {
    recordings: recordings,
    updateRecording: updateRecording
  }));
};

var _default = App;
exports.default = _default;

async function getUserMedia() {
  return navigator.mediaDevices.getUserMedia({
    audio: true,
    video: false
  }).then(setupForRecording).catch(() => {
    mergeState({
      error: 'You denied access to the microphone so this demo will not work.'
    });
  });
}

function setupForRecording(stream) {
  const mimeType = 'audio/webm';
  const recRef = new MediaRecorder(stream, {
    type: mimeType
  });
  mergeState({
    recorder: recRef
  });
  let chunks = [];
  recRef.addEventListener('dataavailable', event => {
    if (typeof event.data === 'undefined') return;
    if (event.data.size === 0) return;
    chunks.push(event.data);
  });
  recRef.addEventListener('stop', () => {
    const blob = new Blob(chunks, {
      type: mimeType
    });
    const newRecording = {
      url: URL.createObjectURL(blob),
      createdAt: Date.now()
    };
    chunks = [];
    setState(state => ({ ...state,
      recordings: state.recordings ? [...state.recordings, newRecording] : [newRecording]
    }));
  });
}
},{"hyperapp":"node_modules/hyperapp/src/index.js","./button.jsx":"src/components/button.jsx","./recordingList.jsx":"src/components/recordingList.jsx","./app.css":"src/components/app.css"}],"src/styles.css":[function(require,module,exports) {
var reloadCSS = require('_css_loader');

module.hot.dispose(reloadCSS);
module.hot.accept(reloadCSS);
module.exports = {};
},{"_css_loader":"node_modules/parcel-bundler/src/builtins/css-loader.js"}],"src/index.js":[function(require,module,exports) {
"use strict";

var _hyperapp = require("hyperapp");

var _app = _interopRequireWildcard(require("./components/app.jsx"));

require("./styles.css");

function _interopRequireWildcard(obj) { if (obj && obj.__esModule) { return obj; } else { var newObj = {}; if (obj != null) { for (var key in obj) { if (Object.prototype.hasOwnProperty.call(obj, key)) { var desc = Object.defineProperty && Object.getOwnPropertyDescriptor ? Object.getOwnPropertyDescriptor(obj, key) : {}; if (desc.get || desc.set) { Object.defineProperty(newObj, key, desc); } else { newObj[key] = obj[key]; } } } } newObj.default = obj; return newObj; } }

const state = {
  error: '',
  recorder: undefined,
  isRecording: false,
  recordings: []
};
(0, _hyperapp.app)({
  init: state,
  view: _app.default,
  node: document.getElementById('app-root'),
  subscriptions: s => console.log('state', s),

  middleware(dispatch) {
    (0, _app.setDispatch)(dispatch);
    return dispatch;
  }

});
},{"hyperapp":"node_modules/hyperapp/src/index.js","./components/app.jsx":"src/components/app.jsx","./styles.css":"src/styles.css"}],"node_modules/parcel-bundler/src/builtins/hmr-runtime.js":[function(require,module,exports) {
var global = arguments[3];
var OVERLAY_ID = '__parcel__error__overlay__';
var OldModule = module.bundle.Module;

function Module(moduleName) {
  OldModule.call(this, moduleName);
  this.hot = {
    data: module.bundle.hotData,
    _acceptCallbacks: [],
    _disposeCallbacks: [],
    accept: function (fn) {
      this._acceptCallbacks.push(fn || function () {});
    },
    dispose: function (fn) {
      this._disposeCallbacks.push(fn);
    }
  };
  module.bundle.hotData = null;
}

module.bundle.Module = Module;
var checkedAssets, assetsToAccept;
var parent = module.bundle.parent;

if ((!parent || !parent.isParcelRequire) && typeof WebSocket !== 'undefined') {
  var hostname = "" || location.hostname;
  var protocol = location.protocol === 'https:' ? 'wss' : 'ws';
  var ws = new WebSocket(protocol + '://' + hostname + ':' + "61278" + '/');

  ws.onmessage = function (event) {
    checkedAssets = {};
    assetsToAccept = [];
    var data = JSON.parse(event.data);

    if (data.type === 'update') {
      var handled = false;
      data.assets.forEach(function (asset) {
        if (!asset.isNew) {
          var didAccept = hmrAcceptCheck(global.parcelRequire, asset.id);

          if (didAccept) {
            handled = true;
          }
        }
      }); // Enable HMR for CSS by default.

      handled = handled || data.assets.every(function (asset) {
        return asset.type === 'css' && asset.generated.js;
      });

      if (handled) {
        console.clear();
        data.assets.forEach(function (asset) {
          hmrApply(global.parcelRequire, asset);
        });
        assetsToAccept.forEach(function (v) {
          hmrAcceptRun(v[0], v[1]);
        });
      } else {
        window.location.reload();
      }
    }

    if (data.type === 'reload') {
      ws.close();

      ws.onclose = function () {
        location.reload();
      };
    }

    if (data.type === 'error-resolved') {
      console.log('[parcel] ✨ Error resolved');
      removeErrorOverlay();
    }

    if (data.type === 'error') {
      console.error('[parcel] 🚨  ' + data.error.message + '\n' + data.error.stack);
      removeErrorOverlay();
      var overlay = createErrorOverlay(data);
      document.body.appendChild(overlay);
    }
  };
}

function removeErrorOverlay() {
  var overlay = document.getElementById(OVERLAY_ID);

  if (overlay) {
    overlay.remove();
  }
}

function createErrorOverlay(data) {
  var overlay = document.createElement('div');
  overlay.id = OVERLAY_ID; // html encode message and stack trace

  var message = document.createElement('div');
  var stackTrace = document.createElement('pre');
  message.innerText = data.error.message;
  stackTrace.innerText = data.error.stack;
  overlay.innerHTML = '<div style="background: black; font-size: 16px; color: white; position: fixed; height: 100%; width: 100%; top: 0px; left: 0px; padding: 30px; opacity: 0.85; font-family: Menlo, Consolas, monospace; z-index: 9999;">' + '<span style="background: red; padding: 2px 4px; border-radius: 2px;">ERROR</span>' + '<span style="top: 2px; margin-left: 5px; position: relative;">🚨</span>' + '<div style="font-size: 18px; font-weight: bold; margin-top: 20px;">' + message.innerHTML + '</div>' + '<pre>' + stackTrace.innerHTML + '</pre>' + '</div>';
  return overlay;
}

function getParents(bundle, id) {
  var modules = bundle.modules;

  if (!modules) {
    return [];
  }

  var parents = [];
  var k, d, dep;

  for (k in modules) {
    for (d in modules[k][1]) {
      dep = modules[k][1][d];

      if (dep === id || Array.isArray(dep) && dep[dep.length - 1] === id) {
        parents.push(k);
      }
    }
  }

  if (bundle.parent) {
    parents = parents.concat(getParents(bundle.parent, id));
  }

  return parents;
}

function hmrApply(bundle, asset) {
  var modules = bundle.modules;

  if (!modules) {
    return;
  }

  if (modules[asset.id] || !bundle.parent) {
    var fn = new Function('require', 'module', 'exports', asset.generated.js);
    asset.isNew = !modules[asset.id];
    modules[asset.id] = [fn, asset.deps];
  } else if (bundle.parent) {
    hmrApply(bundle.parent, asset);
  }
}

function hmrAcceptCheck(bundle, id) {
  var modules = bundle.modules;

  if (!modules) {
    return;
  }

  if (!modules[id] && bundle.parent) {
    return hmrAcceptCheck(bundle.parent, id);
  }

  if (checkedAssets[id]) {
    return;
  }

  checkedAssets[id] = true;
  var cached = bundle.cache[id];
  assetsToAccept.push([bundle, id]);

  if (cached && cached.hot && cached.hot._acceptCallbacks.length) {
    return true;
  }

  return getParents(global.parcelRequire, id).some(function (id) {
    return hmrAcceptCheck(global.parcelRequire, id);
  });
}

function hmrAcceptRun(bundle, id) {
  var cached = bundle.cache[id];
  bundle.hotData = {};

  if (cached) {
    cached.hot.data = bundle.hotData;
  }

  if (cached && cached.hot && cached.hot._disposeCallbacks.length) {
    cached.hot._disposeCallbacks.forEach(function (cb) {
      cb(bundle.hotData);
    });
  }

  delete bundle.cache[id];
  bundle(id);
  cached = bundle.cache[id];

  if (cached && cached.hot && cached.hot._acceptCallbacks.length) {
    cached.hot._acceptCallbacks.forEach(function (cb) {
      cb();
    });

    return true;
  }
}
},{}]},{},["node_modules/parcel-bundler/src/builtins/hmr-runtime.js","src/index.js"], null)
//# sourceMappingURL=/src.a2b27638.js.map