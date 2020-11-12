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
        this.state = {
            dataAPIReady: false,
            playerAPIReady: false
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

    initPlayerAPI = (id) => {
        this.playerAPI.initIFrameAPI(id)
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
            this.initPlayerAPI(id)
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
                    <TabComponent auth={this.props.auth} user={this.props.user} handleLogOut={this.props.handleLogOut}/>
                </Row>
                <Row id="mid-container" style={{marginLeft:'0px'}}>
                    <Col id="side-list-container" sm={2} md={2} lg={2} xl={2}>
                    <header className='Session-Side-List'>
                        <SessionSideList axiosWrapper={this.props.axiosWrapper} />
                    </header>
                    </Col>
                    <Col id="screen-container">
                        <Switch>
                            <Route path='/main/search' render={(props) => <SearchScreen {...props} auth={this.props.auth} history={this.props.user.history} queryVideos={this.queryVideos} playVideo={this.playVideo} queue={this.queue} axiosWrapper = {this.props.axiosWrapper}/>} />
                            <Route path={['/main/session/:sessionId']} render={(props) => <SessionScreen {...props} auth={this.props.auth} key={props.match.params.sessionId} queue={this.queue} axiosWrapper = {this.props.axiosWrapper} />} />
                            <Route path='/main/profile/:userId' render={(props) => <ProfileScreen {...props} auth={this.props.auth} user={this.props.user} axiosWrapper = {this.props.axiosWrapper}/>} />
                            <Route path='/main/collection/:collectionId' render={(props) => <CollectionScreen {...props} auth={this.props.auth} axiosWrapper = {this.props.axiosWrapper}/>} />
                            <Route path='/main/collection' render={(props) => <CollectionScreen {...props} auth={this.props.auth} />} axiosWrapper = {this.props.axiosWrapper}/>
                            <Route path='/main/settings' render={(props) => <SettingsScreen {...props} auth={this.props.auth} user={this.props.user} axiosWrapper = {this.props.axiosWrapper}/>} />
                            <Route path='/' render={(props) => <HomeScreen {...props} auth={this.props.auth} axiosWrapper = {this.props.axiosWrapper}/>} />
                        </Switch>
                    </Col>
                </Row>
                <Row id="bottom-container">
                    <div id='yt-player'></div>
                    <Player 
                        initPlayerAPI={this.initPlayerAPI}
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