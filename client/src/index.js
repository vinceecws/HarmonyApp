import React from 'react';
import ReactDOM from 'react-dom';
import './index.css';
import App from './App';

import LoginPage from './components/LoginScreen.js'
import '../node_modules/bootstrap/dist/css/bootstrap.min.css';
import '../node_modules/bootstrap/js/dist/modal.js';
import '../node_modules/bootstrap/dist/js/bootstrap.js';
import 'react-bootstrap-range-slider/dist/react-bootstrap-range-slider.css';


import * as serviceWorker from './serviceWorker';



ReactDOM.render(
  <React.StrictMode>
    <App/>
  </React.StrictMode>,
  document.getElementById('root')
);

// If you want your app to work offline and load faster, you can change
// unregister() to register() below. Note this comes with some pitfalls.
// Learn more about service workers: https://bit.ly/CRA-PWA
serviceWorker.unregister();
