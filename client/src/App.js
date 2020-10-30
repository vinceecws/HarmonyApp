import React from 'react';


import MainApp from './components/MainApp.js'
import LoginScreen from './components/LoginScreen.js'

import { Container } from 'react-bootstrap';

import { BrowserRouter as Router, Route, Switch } from 'react-router-dom'

import './App.css';
import { genSampleUsers } from './test/genSamples.js'

class App extends React.Component {

  constructor(props) {
    super(props)
    var user = genSampleUsers()[0]
    this.state = {
<<<<<<< HEAD
      auth: user.Id,
=======
      auth: user.Id,   //null
>>>>>>> 7e21ead4186a027069d4a6179480f0cb1594a3f5
      user: user
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
