import React from 'react';
import ReactDOM from 'react-dom';

import App from './App';

import '../node_modules/bootstrap/js/dist/modal.js';
import '../node_modules/bootstrap/dist/js/bootstrap.js';


import * as serviceWorker from './serviceWorker';

const index_css = import(/* webpackChunkName: "0_index" */ './index.css');
const app_css = import(/* webpackChunkName: "1_app" */ './App.css');
const slider_css = import(/* webpackChunkName: "2_slider" */ 'react-bootstrap-range-slider/dist/react-bootstrap-range-slider.css');
const bootstrap_css = import(/* webpackChunkName: "3_bootstrap" */ '../node_modules/bootstrap/dist/css/bootstrap.min.css');

String.prototype.capitalize = function() {
  return this[0].toUpperCase() + this.substr(1)
}

ReactDOM.render(

  <React.StrictMode>
	<script src="/__/firebase/8.0.0/firebase-app.js"></script>
	<script src="/__/firebase/init.js"></script>
    <App/>
  </React.StrictMode>,
  document.getElementById('root')

);

// If you want your app to work offline and load faster, you can change
// unregister() to register() below. Note this comes with some pitfalls.
// Learn more about service workers: https://bit.ly/CRA-PWA
serviceWorker.unregister();
