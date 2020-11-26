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

import { Row, Col } from 'react-bootstrap';
import { Route, Switch } from 'react-router-dom'
import Queue from './Queues/Queue';

class MainApp extends React.Component {

    constructor(props) {
        super(props)
        this.queue = new Queue()
        this.playerAPI = new PlayerAPI()
        this.dataAPI = new DataAPI()
    }

    isFavorited = () => {
        return false
    }

    /*
        PlayerAPI methods
    */

    /*
        playVideo is used to clear the current queue and playing the
        desired song 
    */
    playVideo = (id) => {
        this.fetchVideoById(id, true).then((song) => {
            this.queue.clearFutureQueue()
            this.queue.setCurrentSong(song)
        })

        if (this.playerAPI.isPlayerInit() === false) { //Initialize on first use
            this.playerAPI.initIFrameAPI(id)
        }
        else {
            this.playerAPI.loadVideoById(id)
        }
    }

    /*
        DataAPI methods
    */

    queryVideos = (query) => {
        return this.dataAPI.queryVideos(query)
    }
    
    fetchVideoById = (id, snippet=false) => {
        return this.dataAPI.fetchVideoById(id, snippet)
    }

    render() {
        return(
            <div id="main-app-container">
                <Row id="top-container">
                    <TabComponent auth={this.props.auth} user={this.props.user} axiosWrapper={this.props.axiosWrapper} handleLogOut={this.props.handleLogOut} history={this.props.history}/>
                </Row>
                <Row id="mid-container" style={{marginLeft:'0px'}}>
                    <Col id="side-list-container" sm={2} md={2} lg={2} xl={2}>
                    <header className='Session-Side-List'>
                        <SessionSideList axiosWrapper={this.props.axiosWrapper} />
                    </header>
                    </Col>
                    <Col id="screen-container">
                        <Switch>
                            <Route path='/main/search' render={(props) => <SearchScreen {...props} auth={this.props.auth} user={this.props.user} handleUpdateUser={this.props.handleUpdateUser} fetchVideoById={this.fetchVideoById} queryVideos={this.queryVideos} playVideo={this.playVideo} queue={this.queue} axiosWrapper={this.props.axiosWrapper}/>} />
                            <Route path={['/main/session/:sessionId', '/main/session']} render={(props) => <SessionScreen {...props} auth={this.props.auth} user={this.props.user} key={props.match.params.sessionId} handleUpdateUser={this.props.handleUpdateUser} fetchVideoById={this.fetchVideoById} queue={this.queue} axiosWrapper={this.props.axiosWrapper} />} />
                            <Route path='/main/profile/:userId' render={(props) => <ProfileScreen {...props} auth={this.props.auth} key={props.match.params.userId} handleUpdateUser={this.props.handleUpdateUser} fetchVideoById={this.fetchVideoById} user={this.props.user} playVideo={this.playVideo} queue={this.queue} axiosWrapper={this.props.axiosWrapper}/>} />
                            <Route path='/main/collection/:collectionId' render={(props) => <CollectionScreen {...props} auth={this.props.auth} key={props.match.params.collectionId} user={this.props.user} handleUpdateUser={this.props.handleUpdateUser} axiosWrapper={this.props.axiosWrapper} queue={this.queue} dataAPI={this.dataAPI} playVideo={this.playVideo} playerAPI={this.playerAPI}/>} />
                            <Route path='/main/collection' render={(props) => <CollectionScreen {...props} auth={this.props.auth} user={this.props.user} handleUpdateUser={this.props.handleUpdateUser} axiosWrapper={this.props.axiosWrapper} />} />
                            <Route path='/main/settings' render={(props) => <SettingsScreen {...props} auth={this.props.auth} user={this.props.user} handleUpdateUser={this.props.handleUpdateUser} axiosWrapper={this.props.axiosWrapper}/>} />
                            <Route path='/' render={(props) => <HomeScreen {...props} auth={this.props.auth} user={this.props.user} handleUpdateUser={this.props.handleUpdateUser} axiosWrapper={this.props.axiosWrapper}/>} />
                        </Switch>
                    </Col>
                </Row>
                <Row id="bottom-container">
                    <div id='yt-player'></div>
                    <Player
                        user={this.props.user} 
                        initPlayerAPI={this.initPlayerAPI}
                        queue={this.queue}
                        playerAPI={this.playerAPI}
                        handleUpdateUser={this.props.handleUpdateUser}
                        axiosWrapper={this.props.axiosWrapper}          
                    />
                </Row>
            </div>
        )
    }
}

export default MainApp;