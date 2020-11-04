import React from 'react';
import { icon_music_album_1 } from '../graphics'
import DataAPI from '../youtube-api/DataAPI'
import PlayerAPI from '../youtube-api/PlayerAPI'

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

import { repeatStates } from '../const'
const _ = require('lodash');

class MainApp extends React.Component {

    constructor(props) {
        super(props)
        this.state = {
            dataAPIReady: false,
            playerReady: false,
            currentSong: {
                name: "",
                creator: "",
                image: icon_music_album_1
            },
            pastQueue: [],
            futureQueue: []
        }

        this.dataAPI = new DataAPI((() => {
            this.setState({
                dataAPIReady: true
            })
        }).bind(this))

        this.playerAPI = new PlayerAPI((() => {
            this.setState({
                playerReady: true
            })
        }).bind(this))
        
    }

    nextSong = () => {
        var futureQueue, currentSong, pastQueue
        if (this.state.futureQueue.length > 0) {
            futureQueue = _.cloneDeep(this.state.futureQueue)
            currentSong = futureQueue.shift()
            pastQueue = _.cloneDeep(this.state.pastQueue)
            pastQueue.push(this.state.currentSong)
            this.setState({
                currentSong: currentSong,
                pastQueue: pastQueue,
                futureQueue: futureQueue
            })
        }
        else if (this.state.repeat === repeatStates.QUEUE) { //Get one song at a time from pastQueue
            pastQueue = _.cloneDeep(this.state.pastQueue)
            currentSong = pastQueue.shift()
            pastQueue.push(this.state.currentSong)
            this.setState({
                currentSong: currentSong,
                pastQueue: pastQueue,
            })
        }
    }

    previousSong = () => {
        if (this.state.currentTime > 5) {
            this.handleSeek(0)
        }
        else if(this.state.pastQueue.length > 0) {
            var pastQueue = _.cloneDeep(this.state.pastQueue)
            var currentSong = pastQueue.pop()
            var futureQueue = _.cloneDeep(this.state.futureQueue)
            futureQueue.unshift(this.state.currentSong)
            this.setState({
                currentSong: currentSong,
                pastQueue: pastQueue,
                futureQueue: futureQueue
            })
        }
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
                            <Route path={['/main/session', '/main/session/:sessionId']} render={(props) => <SessionScreen {...props} auth={this.props.auth} />} />
                            <Route path='/main/search' render={(props) => <SearchScreen {...props} auth={this.props.auth} history={this.props.user.history} dataAPIReady={this.state.dataAPIReady} queryVideos={this.dataAPI.queryVideos} />} />
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
                    <div id="yt-player"></div>
                    <Player 
                        /* Queue states */
                        currentSong={this.state.currentSong}
                        pastQueue={this.state.pastQueue}
                        futureQueue={this.state.futureQueue}

                        /* Player states */
                        isPaused={this.playerAPI.isPaused}
                        getVolume={this.playerAPI.getVolume}
                        isMuted={this.playerAPI.isMuted}
                        getDuration={this.playerAPI.getDuration}
                        getCurrentTime={this.playerAPI.getCurrentTime}
                        getShuffle={this.getShuffle}
                        getRepeat={this.getRepeat}
                        isFavorited={this.isFavorited}

                        /* Player functions */
                        playVideo={this.playerAPI.playVideo}
                        pauseVideo={this.playerAPI.pauseVideo}
                        seekTo={this.playerAPI.seekTo}
                        mute={this.playerAPI.mute}
                        unMute={this.playerAPI.unMute}
                        setVolume={this.playerAPI.setVolume}
                        
                    />
                </Row>
            </div>
        )
    }
}

export default MainApp;