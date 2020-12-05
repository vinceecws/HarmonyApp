import React from 'react';

import { mainScreens } from '../const'
import TabComponent from './TabComponent.js'
import Player from './Player.js'
import SessionSideList from './Sessions/SessionsSideList.js'

import HomeScreen from './HomeScreen.js'
import SettingsScreen from './SettingsScreen.js'
import SearchScreen from './SearchScreen.js'
import ProfileScreen from './ProfileScreen.js'
import SessionScreen from './SessionScreen.js'
import CollectionScreen from './CollectionScreen.js'

import { Row, Col } from 'react-bootstrap'
import { Route, Switch } from 'react-router-dom'

class MainApp extends React.Component {

    constructor(props) {
        super(props)
        this.playerAPI = this.props.playerAPI
        this.dataAPI = this.props.dataAPI
        this.queue = this.props.queue
        this.state = {
            currentScreen: mainScreens.HOME,
            screenProps: null
        }
    }

    /* Screen navigation */

    switchScreen = (newScreen, screenProps) => {
        /* 
            Screens are indexed according to the enum mainScreens

            Calling switchScreen without passing screenProps is mainly used for switching screens
            without re-rendering the existing content of the screen
        */

        if (screenProps) {
            this.setState({
                currentScreen: newScreen,
                screenProps: screenProps
            })
        }
        else {
            this.setState({
                currentScreen: newScreen
            })
        }
    }

    getScreenVisibility = (thisScreen) => {
        return thisScreen === this.state.currentScreen ? true : false
    }

    getScreenProps = (thisScreen) => {
        return thisScreen === this.state.currentScreen ? this.state.screenProps : null
    }

    /*
        PlayerAPI methods
    */

    /*
        playVideo is used to clear the current queue and playing the
        desired song 
    */
    playVideo = (id) => {

        this.queue.clearFutureQueue()
        this.fetchVideoById(id, true).then((song) => {
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

    shouldStartSession = () => {
        return this.props.user && !this.props.user.privateMode && !this.props.user.live
    }

    render() {
        return(
            <div id="main-app-container">
                <Row id="top-container">
                    <TabComponent switchScreen={this.switchScreen} currentScreen={this.state.currentScreen} auth={this.props.auth} user={this.props.user} axiosWrapper={this.props.axiosWrapper} handleLogOut={this.props.handleLogOut} history={this.props.history} currentSession={this.props.currentSession}/>
                </Row>
                <Row id="mid-container" style={{marginLeft:'0px'}}>
                    <Col id="side-list-container" sm={2} md={2} lg={2} xl={2}>
                    <header className='Session-Side-List'>
                        <SessionSideList switchScreen={this.switchScreen} axiosWrapper={this.props.axiosWrapper} mainSocket={this.props.mainSocket} />
                    </header>
                    </Col>
                    <Col id="screen-container">
                        <SearchScreen visible={this.getScreenVisibility(mainScreens.SEARCH)} switchScreen={this.switchScreen} screenProps={this.getScreenProps(mainScreens.SEARCH)} auth={this.props.auth} user={this.props.user} handleUpdateUser={this.props.handleUpdateUser} fetchVideoById={this.fetchVideoById} queryVideos={this.queryVideos} playVideo={this.playVideo} queue={this.queue} currentSession={this.props.currentSession} shouldStartSession={this.shouldStartSession} axiosWrapper={this.props.axiosWrapper}/>
                        <SessionScreen visible={this.getScreenVisibility(mainScreens.SESSION)} switchScreen={this.switchScreen} screenProps={this.getScreenProps(mainScreens.SESSION)} auth={this.props.auth} user={this.props.user} handleUpdateUser={this.props.handleUpdateUser} fetchVideoById={this.fetchVideoById} queue={this.queue} playVideo={this.playVideo} axiosWrapper={this.props.axiosWrapper} currentSession={this.props.currentSession} sessionClient={this.props.sessionClient} playerAPI={this.playerAPI}/>
                        <ProfileScreen visible={this.getScreenVisibility(mainScreens.PROFILE)} switchScreen={this.switchScreen} screenProps={this.getScreenProps(mainScreens.PROFILE)} auth={this.props.auth} handleUpdateUser={this.props.handleUpdateUser} fetchVideoById={this.fetchVideoById} user={this.props.user} playVideo={this.playVideo} queue={this.queue} currentSession={this.props.currentSession} shouldStartSession={this.shouldStartSession} axiosWrapper={this.props.axiosWrapper}/>
                        <CollectionScreen visible={this.getScreenVisibility(mainScreens.COLLECTION)} switchScreen={this.switchScreen} screenProps={this.getScreenProps(mainScreens.COLLECTION)} auth={this.props.auth} user={this.props.user} handleUpdateUser={this.props.handleUpdateUser} axiosWrapper={this.props.axiosWrapper} queue={this.queue} dataAPI={this.dataAPI} playVideo={this.playVideo} playerAPI={this.playerAPI} currentSession={this.props.currentSession} shouldStartSession={this.shouldStartSession}/>
                        <SettingsScreen visible={this.getScreenVisibility(mainScreens.SETTINGS)} switchScreen={this.switchScreen} screenProps={this.getScreenProps(mainScreens.SETTINGS)} auth={this.props.auth} user={this.props.user} handleUpdateUser={this.props.handleUpdateUser} axiosWrapper={this.props.axiosWrapper} currentSession={this.props.currentSession} />
                        <HomeScreen visible={this.getScreenVisibility(mainScreens.HOME)} switchScreen={this.switchScreen} screenProps={this.getScreenProps(mainScreens.HOME)} auth={this.props.auth} user={this.props.user} handleUpdateUser={this.props.handleUpdateUser} axiosWrapper={this.props.axiosWrapper} currentSession={this.props.currentSession} shouldStartSession={this.shouldStartSession}/>
                    </Col>
                </Row>
                <Row id="bottom-container">
                    <div id='yt-player'></div>
                    <Player
                        switchScreen={this.switchScreen}
                        user={this.props.user} 
                        currentSession={this.props.currentSession}
                        initPlayerAPI={this.initPlayerAPI}
                        queue={this.queue}
                        playerAPI={this.playerAPI}
                        handleUpdateUser={this.props.handleUpdateUser}
                        sessionClient={this.props.sessionClient}
                        axiosWrapper={this.props.axiosWrapper} 
                        history={this.props.history}
                        shouldStartSession={this.shouldStartSession}         
                    />
                </Row>
            </div>
        )
    }
}

export default MainApp;