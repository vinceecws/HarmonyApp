import React from 'react';
import axios from 'axios';

import { io } from 'socket.io-client'
import SessionClient from './api/SessionClient.js'

import DataAPI from './api/DataAPI'
import PlayerAPI from './api/PlayerAPI'
import Queue from './components/Queues/Queue'

import MainApp from './components/MainApp.js'
import LoginScreen from './components/LoginScreen.js'
import { Container } from 'react-bootstrap';

import { BrowserRouter as Router, Route, Switch } from 'react-router-dom'

import AxiosWrapper from './components/axiosWrapper/axiosWrapper.js'

if (process.env.REACT_APP_NODE_ENV === 'development') {
    axios.defaults.baseURL = 'http://localhost:4000'
}
else if (process.env.NODE_ENV === 'production') {
    axios.defaults.baseURL = 'https://harmo-ny.herokuapp.com/'
}
else {
    axios.defaults.baseURL = 'http://localhost:3000'
}

class App extends React.Component {

    constructor(props) {
        super(props)
        this.axiosWrapper = new AxiosWrapper()
        this.playerAPI = new PlayerAPI()
        this.dataAPI = new DataAPI()
        this.queue = new Queue()
        if (process.env.REACT_APP_NODE_ENV === 'development') {
            this.mainSocket = io('http://localhost:4000/main', {
                withCredentials: true
            })
            this.sessionClient = new SessionClient(io('http://localhost:4000/session', {
                withCredentials: true
            }))
        }
        else {
            this.mainSocket = io('/main')
            this.sessionClient = new SessionClient(io('/session'))
        }
        this.state = {
            auth: false,
            user: null,
            currentSession: null
        }
    }
    
    componentDidUpdate = (prevProps, prevState) => {
        if (this.state.user && !prevState.user || !this.state.user && prevState.user) {
            this.sessionClient.disconnect()
            this.sessionClient = new SessionClient(io('/session'))
            this.queue = new Queue()
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

    handleUpdateCurrentSession = (currentSession) => {
        this.setState({
            currentSession: currentSession
        })
    }

    render() {
        return (
            <Container id="app-container">
                <Router>
                    <Switch>
                        <Route path={['/main']} render={(props) => <MainApp {...props} 
                            auth={this.state.auth} 
                            user={this.state.user} 
                            currentSession={this.state.currentSession}
                            mainSocket={this.mainSocket}
                            sessionClient={this.sessionClient} 
                            playerAPI={this.playerAPI} 
                            dataAPI={this.dataAPI} 
                            queue={this.queue}
                            handleLogOut={this.handleLogOut} 
                            handleUpdateUser={this.handleUpdateUser} 
                            handleUpdateCurrentSession={this.handleUpdateCurrentSession} 
                            axiosWrapper={this.axiosWrapper}/>} 
                        />
                        <Route path={['/', '/login']} render={(props) => <LoginScreen {...props} 
                            auth={this.state.auth} 
                            user={this.state.user}
                            playerAPI={this.playerAPI}  
                            currentSession={this.state.currentSession} 
                            handleAuthenticate={this.handleAuthenticate} 
                            handleUpdateCurrentSession={this.handleUpdateCurrentSession}
                            axiosWrapper={this.axiosWrapper} />} 
                        />
                    </Switch>
                </Router>
            </Container>
        );
    }

}

export default App;
