import React from 'react';
import Player from './components/Player.js'
import HomeScreen from './components/HomeScreen.js'
import SettingsScreen from './components/SettingsScreen.js'
import SearchScreen from './components/SearchScreen.js'
import SessionSideList from './components/Sessions/SessionsSideList.js';
import ProfileScreen from './components/ProfileScreen.js';
import { Container, Row, Col } from 'react-bootstrap';
import { BrowserRouter as Router, Route, Switch } from 'react-router-dom'

import './App.css';

function App() {
  
  return (
    <Container id="app-container">
        <Row id="top-container" style={{marginLeft:'0px'}}>
          <Col id="side-list-container" sm={2} md={2} lg={2} xl={2}>
            <header className='Session-Side-List'>
              <SessionSideList/>
            </header>
          </Col>
          <Col id="screen-container">
            <ProfileScreen/>
          </Col>
        </Row>
        <Row id="bottom-container">
          <Player/>
        </Row>
    </Container>

  );
}

export default App;
