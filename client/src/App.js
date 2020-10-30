import React from 'react';
import './App.css';
import Player from './components/Player.js'
import HomeScreen from './components/HomeScreen.js'
import SessionSideList from './components/Sessions/SessionsSideList.js';
import CollectionScreen from './components/CollectionScreen.js';
import { Container, Row, Col } from 'react-bootstrap';
import { BrowserRouter as Router, Route, Switch } from 'react-router-dom';


function App() {
  
  return (
    
      
         
      
    <Container id="app-container">
        <Row id="top-container">
          <Col id="side-list-container" sm={2} md={2} lg={2} xl={2}>
            <header className='Session-Side-List'>
              <SessionSideList/>
            </header>
          </Col>
          <Col id="screen-container">
            <CollectionScreen/>
          </Col>
        </Row>
        <Row id="bottom-container">
          <Player/>
        </Row>
    </Container>

  );
}

export default App;
