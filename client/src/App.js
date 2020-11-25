import React from 'react';
import axios from 'axios';

import MainApp from './components/MainApp.js'
import LoginScreen from './components/LoginScreen.js'
import { Container } from 'react-bootstrap';

import { BrowserRouter as Router, Route, Switch } from 'react-router-dom'

import './App.css';
import AxiosWrapper from './components/axiosWrapper/axiosWrapper.js'
axios.defaults.baseURL = 'http://localhost:3000'

class App extends React.Component {

  constructor(props) {
    super(props)
    this.axiosWrapper = new AxiosWrapper()
    this.state = {
      auth: false,
      user: null
    }
    
  }
  

  handleLogOut = () => {
    this.setState({
      auth: false,
      user: null
    })
  }

  handleAuthenticate = (user) => {
    this.setState({
      auth: true,
      user: user
    })
  }

  handleUpdateUser = (updatedUser) => {
    this.setState({
      auth: true,
      user: updatedUser
    });
  }


  render() {
    return (
      <Container id="app-container">
        <Router>
          <Switch>
            <Route path={['/main']} render={(props) => <MainApp {...props} auth={this.state.auth} user={this.state.user} handleLogOut={this.handleLogOut} handleUpdateUser={this.handleUpdateUser} axiosWrapper={this.axiosWrapper}/>} />
            <Route path={['/', '/login']} render={(props) => <LoginScreen {...props} auth={this.state.auth} handleAuthenticate={this.handleAuthenticate} axiosWrapper={this.axiosWrapper}/>} />
          </Switch>
        </Router>
      </Container>
    );
  }

}

export default App;
