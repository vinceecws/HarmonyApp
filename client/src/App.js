import React from 'react';
import './App.css';
import SessionSideList from './components/Sessions/sessionsidelist.js';
import { BrowserRouter as Router, Route, Switch } from 'react-router-dom'



let collections = require('./test/sampleCollections.json')



console.log(collections);


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
    <div>
      <header className='Session-Side-List'>
        <SessionSideList/>
      </header>
    </div>
    
      
         
      
    
  );
}

export default App;
