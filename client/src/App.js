import React from 'react';
import './App.css';
import Player from './components/Player.js'
import SessionSideList from './components/Sessions/SessionsSideList.js';
import { BrowserRouter as Router, Route, Switch } from 'react-router-dom'

function App() {
  
  return (
    <div>
      <header className='Session-Side-List'>
        <SessionSideList/>
      </header>
      <Player/>
    </div>
    
      
         
      
    
  );
}

export default App;
