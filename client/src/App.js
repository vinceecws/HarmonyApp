import React from 'react';
import logo from './logo.svg';
import './App.css';
import SessionSideList from './components/Sessions/sessionsidelist.js';
import { BrowserRouter as Router, Route, Switch } from 'react-router-dom'


let collections = require('./test/sampleCollections.json')
let sessions = require('./test/sampleSessions.json')


console.log(collections);
console.log(sessions);

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
    <div dangerouslySetInnerHTML={{__html: html}}>
    </div>
    
      
         
      
    
  );
}

export default App;
