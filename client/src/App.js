import React from 'react';
import logo from './logo.svg';
import './App.css';
import { BrowserRouter as Router, Route, Switch } from 'react-router-dom'

let collections = require('./test/sampleCollections.json')

console.log(collections)

var formData  = new FormData();

formData.append("format", "json");
formData.append("url", "http://soundcloud.com/forss/flickermood");

var html = fetch('http://soundcloud.com/oembed', {
    method: 'POST',
    body: formData
}).then(function (response) {
    return response.json();
}).then(function (res) {
  return res.html;
});

function App() {
  return (
    <div dangerouslySetInnerHTML={{__html: html}}></div>
  );
}

export default App;
