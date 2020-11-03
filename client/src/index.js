import React from 'react';
import ReactDOM from 'react-dom';
import './index.css';
import App from './App';
import LoginScreen from './components/LoginScreen.js'
import TabScreen from './components/TabScreen.js'
import CollectionScreen from './components/CollectionScreen.js'
import '../node_modules/bootstrap/dist/css/bootstrap.min.css';
import '../node_modules/bootstrap/js/dist/modal.js';
import '../node_modules/bootstrap/dist/js/bootstrap.js';
import 'react-bootstrap-range-slider/dist/react-bootstrap-range-slider.css';


import * as serviceWorker from './serviceWorker';



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
