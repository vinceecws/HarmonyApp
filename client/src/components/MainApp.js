import React from 'react';
import DataAPI from '../api/DataAPI'
import PlayerAPI from '../api/PlayerAPI'

import TabComponent from './TabComponent.js'
import Player from './Player.js'
import SessionSideList from './Sessions/SessionsSideList.js'

import HomeScreen from './HomeScreen.js'
import SettingsScreen from './SettingsScreen.js'
import SearchScreen from './SearchScreen.js'
import ProfileScreen from './ProfileScreen.js'
import SessionScreen from './SessionScreen.js'
import CollectionScreen from './CollectionScreen.js'
import LoginScreen from './LoginScreen.js'

import { Row, Col } from 'react-bootstrap';
import { Route, Switch } from 'react-router-dom'
import Queue from './Queues/Queue';

class MainApp extends React.Component {

    constructor(props) {
        super(props)
        this.queue = new Queue()
        this.state = {
            dataAPIReady: false,
        }

        this.playerAPI = new PlayerAPI(() => {
            this.setState({
                playerAPIReady: true
            })
        })

        this.dataAPI = new DataAPI(() => {
            this.setState({
                dataAPIReady: true
            })
        })
    }

    isFavorited = () => {
        return false
    }

    getShuffle = () => {
        return false
    }

    getRepeat = () => {
        return false
    }

    initPlayerAPI = (id) => {
        console.log("CALLED")
        this.playerAPI.initIFrameAPI(id)
    }

    

    render() {
        return(
            <div id="main-app-container">
                <Row id="top-container">
                    <TabComponent auth={this.props.auth} user={this.props.user} handleLogOut={this.props.handleLogOut}/>
                </Row>
                <Row id="mid-container" style={{marginLeft:'0px'}}>
                    <Col id="side-list-container" sm={2} md={2} lg={2} xl={2}>
                    <header className='Session-Side-List'>
                        <SessionSideList/>
                    </header>
                    </Col>
                    <Col id="screen-container">
                        <Switch>
                            <Route path={['/main/session', '/main/session/:sessionId']} render={(props) => <SessionScreen {...props} auth={this.props.auth} queue={this.queue}/>} />
                            <Route path='/main/search' render={(props) => <SearchScreen {...props} auth={this.props.auth} history={this.props.user.history} dataAPIReady={this.state.dataAPIReady} dataAPI={this.dataAPI} playerAPI={this.playerAPI} initPlayerAPI={this.initPlayerAPI}/>} />
                            <Route path='/main/profile/:userId' render={(props) => <ProfileScreen {...props} auth={this.props.auth} user={this.props.user} />} />
                            <Route path='/main/collection/:collectionId' render={(props) => <CollectionScreen {...props} auth={this.props.auth} />} />
                            <Route path='/main/collection' render={(props) => <CollectionScreen {...props} auth={this.props.auth} />} />
                            <Route path='/main/settings' render={(props) => <SettingsScreen {...props} auth={this.props.auth} user={this.props.user} />} />
                            <Route path='/login' render={(props) => <LoginScreen {...props} auth={this.props.auth} />} />
                            <Route path='/' render={(props) => <HomeScreen {...props} auth={this.props.auth} />} />
                        </Switch>
                    </Col>
                </Row>
                <Row id="bottom-container">
                    {/* <iframe id="yt-player"
                            src="http://www.youtube.com/embed/esh8mNoPxGE?enablejsapi=1" //Load dummy video to enable API methods
                            allow="autoplay"
                            type="text/html" 
                            width="0" 
                            height="0"
                            frameborder="0">
                    </iframe> */}
                    <div id='yt-player'></div>
                    <Player 
                        queue={this.queue}
                        playerAPI={this.playerAPI}
                        isFavorited={this.isFavorited}                   
                    />
                </Row>
            </div>
        )
    }
}

export default MainApp;