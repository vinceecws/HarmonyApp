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
import { Route } from 'react-router-dom'

const _ = require('lodash')

class MainApp extends React.Component {

    constructor(props) {
        super(props)
        this.playerAPI = this.props.playerAPI
        this.dataAPI = this.props.dataAPI
        this.queue = this.props.queue
        this.isHostSwitchingSessions = false;
        this.isHostHopPromptShowing = false;
        this.isHostLoggingOut = false;
        this.state = {
            displayEndedSessionModal: false,
            currentScreen: mainScreens.HOME,
            screenProps: {
                sessionId: null,
                userId: null,
                collectionId: null
            }
        }
    }

    /* Screen navigation */

    switchScreen = (...args) => {
        /* 
            Screens are indexed according to the enum mainScreens
            switchScreen takes 2 arguments, newScreen in args[0] and ID in args[1]

            Calling switchScreen without passing ID is mainly used for switching screens
            without re-rendering the existing content of the screen

            switchScreen can also be called with ID to update screenProps without switching screens,
            by calling switchScreen(mainScreens[currentScreen], ID)
        */
        var newScreen = args[0]
        if (args.length > 1 && args[1] !== undefined) {
            var newScreenProps = _.cloneDeep(this.state.screenProps)
            var id = args[1]
            switch (newScreen) {
                case mainScreens.SESSION:
                    newScreenProps.sessionId = id
                    break
                case mainScreens.COLLECTION:
                    newScreenProps.collectionId = id
                    break
                case mainScreens.PROFILE:
                    newScreenProps.userId = id
                    break
                default:
            }
            this.setState({
                currentScreen: newScreen,
                screenProps: newScreenProps
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

    /* prompts */

    showSessionEndedModal = () => {
        this.props.history.push('/main/sessionExpiredUser');
    }
    showHostLoggingOutModal = () => {
        this.props.history.push('/main/hostLoggingOut');
    }
    showHostHopSessionModal = () => {
        this.props.history.push('/main/hostSwitchSessions');
        this.isHostHopPromptShowing = true;
    }
    handleCloseModal = () => {
        this.props.history.goBack();
        this.isHostHopPromptShowing = false
    }
    handleCloseHostHopModal = () => {
        console.log("host is not leaving sessions anymore")
        this.props.history.goBack();
        this.isHostHopPromptShowing = false
        this.isHostSwitchingSessions = false
    }
    handleHostHopSession = () => {
        console.log("host clicked ok")
        this.isHostSwitchingSessions = true

        this.handleCloseModal();

    }
    handleHostLoggingOut = () => {
        this.isHostLoggingOut = true;
        
        this.handleCloseModal();

    }
    disableHostSwitching = () =>{
        this.isHostSwitchingSessions = false;
        this.isHostLoggingOut = false;
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
        if (!this.playerAPI.isPlayerInit()) { //Initialize on first use
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

    fetchMostPopular = (max=15, snippet=false) => {
        return this.dataAPI.fetchMostPopular(max, snippet)
    }

    /* 
        Session checkers 
    */

    shouldStartSession = () => {
        /* True if logged-in, not in a Session */
        return this.props.user && !this.props.user.currentSession
    }

    shouldEmitActions = () => {
        /* True if logged-in, in a Session, hosting and not in Private Mode */
        if (this.props.user && this.props.user.currentSession && this.props.user.hosting && this.props.user.live) {
            return true
        }
        return false
    }

    shouldReceiveActions = () => {
        /* True if in a live Session, and not hosting */
        if (this.props.user) {
            if (this.props.user.currentSession && !this.props.user.hosting) {
                return true
            }
            return false
        }
        else if (this.props.currentSession) {
            return true
        }
        return false
    }

    render() {
        return(
            <div id="main-app-container">
                <Row id="top-container">
                    <TabComponent showHostLoggingOutModal={this.showHostLoggingOutModal} isHostLoggingOut={this.isHostLoggingOut} switchScreen={this.switchScreen} currentScreen={this.state.currentScreen} auth={this.props.auth} user={this.props.user} axiosWrapper={this.props.axiosWrapper} handleLogOut={this.props.handleLogOut} history={this.props.history} currentSession={this.props.currentSession}/>
                </Row>
                <Row id="mid-container" style={{marginLeft:'0px'}}>
                    <Col id="side-list-container" sm={2} md={2} lg={2} xl={2}>
                    <header className='Session-Side-List'>
                        <SessionSideList switchScreen={this.switchScreen} axiosWrapper={this.props.axiosWrapper} sessionManager={this.props.sessionManager} />
                    </header>
                    </Col>
                    <Col id="screen-container">

                        <SearchScreen visible={this.getScreenVisibility(mainScreens.SEARCH)} switchScreen={this.switchScreen} screenProps={this.getScreenProps(mainScreens.SEARCH)} auth={this.props.auth} user={this.props.user} handleUpdateUser={this.props.handleUpdateUser} dataAPI={this.dataAPI} fetchVideoById={this.fetchVideoById} queryVideos={this.queryVideos} playVideo={this.playVideo} queue={this.queue} currentSession={this.props.currentSession} shouldStartSession={this.shouldStartSession} shouldEmitActions={this.shouldEmitActions} shouldReceiveActions={this.shouldReceiveActions} axiosWrapper={this.props.axiosWrapper} sessionClient={this.props.sessionClient}/>
                        <SessionScreen visible={this.getScreenVisibility(mainScreens.SESSION)} switchScreen={this.switchScreen} screenProps={this.getScreenProps(mainScreens.SESSION)} history={this.props.history} isHostLoggingOut={this.isHostLoggingOut} handleLogOut={this.props.handleLogOut} clearScreenProps={this.clearScreenProps} disableHostSwitching={this.disableHostSwitching} isHostHopPromptShowing={this.isHostHopPromptShowing} showHostHopSessionModal={this.showHostHopSessionModal} showSessionEndedModal={this.showSessionEndedModal} isHostSwitchingSessions = {this.isHostSwitchingSessions} auth={this.props.auth} user={this.props.user} handleUpdateUser={this.props.handleUpdateUser} handleUpdateCurrentSession={this.props.handleUpdateCurrentSession} fetchVideoById={this.fetchVideoById} queue={this.queue} playVideo={this.playVideo} axiosWrapper={this.props.axiosWrapper} currentSession={this.props.currentSession} sessionClient={this.props.sessionClient} playerAPI={this.playerAPI}/>
                        <ProfileScreen visible={this.getScreenVisibility(mainScreens.PROFILE)} switchScreen={this.switchScreen} screenProps={this.getScreenProps(mainScreens.PROFILE)} auth={this.props.auth} handleUpdateUser={this.props.handleUpdateUser} fetchVideoById={this.fetchVideoById} user={this.props.user} playVideo={this.playVideo} queue={this.queue} currentSession={this.props.currentSession} shouldStartSession={this.shouldStartSession} shouldEmitActions={this.shouldEmitActions} shouldReceiveActions={this.shouldReceiveActions} axiosWrapper={this.props.axiosWrapper} sessionClient={this.props.sessionClient}/>
                        <CollectionScreen visible={this.getScreenVisibility(mainScreens.COLLECTION)} switchScreen={this.switchScreen} screenProps={this.getScreenProps(mainScreens.COLLECTION)} auth={this.props.auth} user={this.props.user} handleUpdateUser={this.props.handleUpdateUser} axiosWrapper={this.props.axiosWrapper} queue={this.queue} dataAPI={this.dataAPI} playVideo={this.playVideo} playerAPI={this.playerAPI} currentSession={this.props.currentSession} shouldStartSession={this.shouldStartSession} shouldEmitActions={this.shouldEmitActions} shouldReceiveActions={this.shouldReceiveActions} sessionClient={this.props.sessionClient}/>
                        <SettingsScreen visible={this.getScreenVisibility(mainScreens.SETTINGS)} switchScreen={this.switchScreen} screenProps={this.getScreenProps(mainScreens.SETTINGS)} auth={this.props.auth} user={this.props.user} handleUpdateUser={this.props.handleUpdateUser} axiosWrapper={this.props.axiosWrapper} currentSession={this.props.currentSession} history={this.props.history}/>
                        <HomeScreen visible={this.getScreenVisibility(mainScreens.HOME)} switchScreen={this.switchScreen} screenProps={this.getScreenProps(mainScreens.HOME)} auth={this.props.auth} user={this.props.user} handleUpdateUser={this.props.handleUpdateUser} axiosWrapper={this.props.axiosWrapper} currentSession={this.props.currentSession} shouldStartSession={this.shouldStartSession} shouldEmitActions={this.shouldEmitActions} shouldReceiveActions={this.shouldReceiveActions} playVideo={this.playVideo} fetchMostPopular={this.fetchMostPopular} fetchVideoById={this.fetchVideoById} queue={this.queue} sessionManager={this.props.sessionManager} sessionClient={this.props.sessionClient}/>
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
                        shouldEmitActions={this.shouldEmitActions}
                        shouldReceiveActions={this.shouldReceiveActions}      
                    />
                </Row>
                <Route path={'/main/sessionExpiredUser'} render={() => { 

                            return(
                            <div id="sessionExpiredUser" className="user-prompt-modal">
                                <div className="login-screen-signup-modal-content"  >
                                    <div className="modal-dialog">
                                        {/* Modal Content */}
                                        <div className="modal-content bg-color-jet color-accented">
                                            <div className="modal-header">
                                                <h3>Session Ended</h3>
                                                <button type="button" className="close color-accented" data-dismiss="modal" onClick={data => this.handleCloseModal(data)}>&times;</button>
                                            </div>
                                            <div className="modal-body">
                                                <p>The Host has ended the Session</p>
                                                
                                            </div>
                                            <div className="modal-footer">
                                                <button type="button" className="btn btn-default bg-color-harmony color-accented" data-dismiss="modal" onClick={data => this.handleCloseModal(data)}>Close</button>
                                            </div>
                                            
                                        </div>
                                    </div>
                                </div>
                            </div>
                        )}}/>
                <Route path={'/main/hostSwitchSessions'} render={() => { 

                            return(
                            <div id="hostSwitchSessions" className="user-prompt-modal">
                                <div className="login-screen-signup-modal-content"  >
                                    <div className="modal-dialog">
                                        {/* Modal Content */}
                                        <div className="modal-content bg-color-jet color-accented">
                                            <div className="modal-header">
                                                <h3>Session Change Detected</h3>
                                                <button type="button" className="close color-accented" data-dismiss="modal" onClick={data => this.handleCloseHostHopModal(data)}>&times;</button>
                                            </div>
                                            <div className="modal-body">
                                                <p>You are currently hosting a session. Switching to another session will end this session. Do you wish to continue?</p>
                                                
                                            </div>
                                            <div className="modal-footer">
                                                <button type="button" className="btn btn-default bg-color-harmony color-accented"  onClick={data => this.handleHostHopSession(data)}>Ok</button>
                                                <button type="button" className="btn btn-default bg-color-harmony color-accented" data-dismiss="modal" onClick={data => this.handleCloseHostHopModal(data)}>Close</button>
                                            </div>
                                            
                                        </div>
                                    </div>
                                </div>
                            </div>
                        )}}/>
                <Route path={'/main/hostLoggingOut'} render={() => { 

                            return(
                            <div id="hostLoggingOut" className="user-prompt-modal">
                                <div className="login-screen-signup-modal-content"  >
                                    <div className="modal-dialog">
                                        {/* Modal Content */}
                                        <div className="modal-content bg-color-jet color-accented">
                                            <div className="modal-header">
                                                <h3>Session Change Detected</h3>
                                                <button type="button" className="close color-accented" data-dismiss="modal" onClick={data => this.handleCloseHostHopModal(data)}>&times;</button>
                                            </div>
                                            <div className="modal-body">
                                                <p>You are currently hosting a session. Logging out will end this session. Do you wish to continue?</p>
                                                
                                            </div>
                                            <div className="modal-footer">
                                                <button type="button" className="btn btn-default bg-color-harmony color-accented"  onClick={data => this.handleHostLoggingOut(data)}>Ok</button>
                                                <button type="button" className="btn btn-default bg-color-harmony color-accented" data-dismiss="modal" onClick={data => this.handleCloseHostHopModal(data)}>Close</button>
                                            </div>
                                            
                                        </div>
                                    </div>
                                </div>
                            </div>
                        )}}/>
            </div>

        )
    }
}

export default MainApp;