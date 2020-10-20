import React from 'react';
import './App.css';
import SessionSideList from './components/Sessions/SessionsSideList.js';
import { BrowserRouter as Router, Route, Switch } from 'react-router-dom'

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
