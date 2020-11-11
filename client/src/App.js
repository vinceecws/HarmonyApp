import React from 'react';
import axios from 'axios';

import MainApp from './components/MainApp.js'
import LoginScreen from './components/LoginScreen.js'
import { Container } from 'react-bootstrap';

import { BrowserRouter as Router, Route, Switch } from 'react-router-dom'

import './App.css';
import { genSampleUsers } from './test/genSamples.js'
axios.defaults.baseURL = 'http://localhost:4000'

class App extends React.Component {

  constructor(props) {
    super(props)
    var user = genSampleUsers()[0]
    this.state = {

      auth: user.Id,   //null

      user: user,
    }
  }
  

  handleLogOut() {
    this.setState({
      auth: null,
    })
  }

  handleAuthenticate(auth) {
    this.setState({
      auth: auth
    })
  }


  render() {
    return (
      <Container id="app-container">
        <Router>
          <Switch>
            <Route path={['/login']} render={(props) => <LoginScreen {...props} auth={this.state.auth} handleAuthenticate={this.handleAuthenticate}/>} />
            <Route path={['/', '/main']} render={(props) => <MainApp {...props} auth={this.state.auth} user={this.state.user} handleLogOut={this.handleLogOut.bind(this)}/>} />
          </Switch>
        </Router>
      </Container>
    );
  }

}

export default App;
