import React from 'react';
import logo from './logo.svg';
import './App.css';
import SessionSideList from './components/Sessions/sessionsidelist.js';
import { BrowserRouter as Router, Route, Switch } from 'react-router-dom'

let collections = JSON.parse(require('./test/sampleCollections.json'))
let sessions = JSON.parse(require('./test/sampleSessions.json'))

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
  var Session1 = sessions[0];
  return (
    <div dangerouslySetInnerHTML={{__html: html}}>
      <header className="Session-Component">
         <SessionSideList 
            hostId={Session1.hostId}
            name={Session1.name}/>
      </header>
    </div>
  );
}

export default App;
