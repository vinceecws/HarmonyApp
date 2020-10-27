import React from 'react';
import ReactDOM from 'react-dom';
import './index.css';
import App from './App';
import LoginScreen from './components/LoginScreen.js'
import TabScreen from './components/TabScreen.js'
import '../node_modules/bootstrap/dist/css/bootstrap.min.css';
import '../node_modules/bootstrap/js/dist/modal.js';
import 'react-bootstrap-range-slider/dist/react-bootstrap-range-slider.css';


import * as serviceWorker from './serviceWorker';
import 'bootstrap/dist/css/bootstrap.min.css';

ReactDOM.render(
  <React.StrictMode>
    <TabScreen/>
  </React.StrictMode>,
  document.getElementById('root')
);

// If you want your app to work offline and load faster, you can change
// unregister() to register() below. Note this comes with some pitfalls.
// Learn more about service workers: https://bit.ly/CRA-PWA
serviceWorker.unregister();
