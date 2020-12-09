import React from 'react';
import Ticker from 'react-ticker';
import RangeSlider from 'react-bootstrap-range-slider';
import { Container, Row, Col, Image, Button } from 'react-bootstrap';
import { icon_play_2, icon_pause_3, icon_previous, icon_next, icon_repeat_3, icon_repeat_1, icon_shuffle_arrows, icon_volume_up_1, icon_no_sound } from '../graphics';
import { ReactComponent as FavoriteButton } from '../graphics/music_player_pack/035-like.svg'
import { repeatStates, mainScreens } from '../const'

class Player extends React.Component {

    constructor(props) {
        super(props)
        this.state = {
            user: this.props.user,
            showTitleTicker: false,
            showCreatorTicker: false,
            paused: this.props.playerAPI.isPaused(),
            repeat: this.props.queue.getRepeat(),
            shuffle: this.props.queue.getShuffle(),
            currentSong: this.props.queue.getCurrentSong(),
            currentTime: this.props.playerAPI.getCurrentTime(),
            seeking: false
        }
    }

    componentDidMount = () => {
        this.playerActionListener = this.props.sessionClient.subscribeToAction("rcvdPlayer", this.handleApplyPlayerState.bind(this))
        this.queueActionListener = this.props.sessionClient.subscribeToAction("rcvdQueue", this.handleApplyPlayerState.bind(this))

        this.currentSongChangeListener = this.props.queue.subscribeToEvent("currentSongChange", this.handleQueueStateChange.bind(this))
        this.repeatStateChangeListener = this.props.queue.subscribeToEvent("repeatStateChange", this.handleQueueStateChange.bind(this))
        this.shuffleStateChangeListener = this.props.queue.subscribeToEvent("shuffleStateChange", this.handleQueueStateChange.bind(this))

        this.props.playerAPI.subscribeToEvent("onPlayerStateChange", this.handlePlayerStateChange.bind(this))

        this.playerTimeListener = setInterval(() => {
            if (!this.state.seeking) {
                this.setState({
                    currentTime: this.props.playerAPI.getCurrentTime() 
                })
            }
        }, 1000)
    }

    componentDidUpdate = (prevProps, prevState) => {
        if (prevState.user !== this.props.user) {
            this.setState({
                user: this.props.user
            })
        }
    }

    componentWillUnmount = () => {
        this.playerActionListener = this.props.sessionClient.unsubscribeFromAction("rcvdPlayer", this.playerActionListener)
        this.queueActionListener = this.props.sessionClient.unsubscribeFromAction("rcvdQueue", this.queueActionListener)

        this.currentSongChangeListener = this.props.queue.unsubscribeFromEvent("currentSongChange", this.currentSongChangeListener)
        this.repeatStateChangeListener = this.props.queue.unsubscribeFromEvent("repeatStateChange", this.repeatStateChangeListener)
        this.shuffleStateChangeListener = this.props.queue.unsubscribeFromEvent("shuffleStateChange", this.shuffleStateChangeListener)

        this.props.playerAPI.unsubscribeFromEvent("onPlayerStateChange")

        clearInterval(this.playerTimeListener)
    }

    handleShowTitleTicker = () => {
        this.setState({
            showTitleTicker: true
        })
    }

    handleHideTitleTicker = () => {
        this.setState({
            showTitleTicker: false
        })
    }

    handleShowCreatorTicker = () => {
        this.setState({
            showCreatorTicker: true
        })
    }

    handleHideCreatorTicker = () => {
        this.setState({
            showCreatorTicker: false
        })
    }

    handleCreateSession = () => {
        this.props.axiosWrapper.axiosPost('/api/session/newSession', {
            name: `${this.state.user.username}'s Live Session`
        }, (function(res, data) {
			if (data.success) {
                this.props.handleUpdateUser(data.data.user)
                this.props.switchScreen(mainScreens.SESSION, data.data.sessionId)
			}
		}).bind(this), true)
    }

    handleEmitPlayerState = (action, subaction, ...args) => {
        if (!(this.props.currentSession && this.isHost())) {
            return
        }

        var username = this.state.user.username
        var userId = this.state.user._id
        var data = {}
        
        if (action === "player") {
            data.subaction = subaction
            this.props.sessionClient.emitPlayer(username, userId, data)
        }
        else if (action === "queue") {
            data.subaction = subaction
            data.state = args[0]
            this.props.sessionClient.emitQueue(username, userId, data)
        }
    }

    handleQueueStateChange = (event, newState) => {
        switch (event) {
            case "currentSongChange":
                this.setState({
                    currentSong: newState
                })
                break
            case "repeatStateChange":
                this.setState({
                    repeat: newState
                })
                break
            case "shuffleStateChange":
                this.setState({
                    shuffle: newState
                })
                break
            default:
                break
        }
    }

    handleApplyPlayerState = (action, actionObj) => {
        if (this.props.currentSession && this.isHost()) {
            return
        }

        if (actionObj.action === "player") {
            switch (actionObj.data.subaction) {
                case "play":
                    this.handleSetPlay(true)
                    break
                case "pause":
                    this.handleSetPlay(false)
                    break
                case "next_song":
                    this.handleNextSong()
                    break
                case "prev_song":
                    this.handlePreviousSong()
                    break
                default:
                    console.log("Invalid subaction")
            }
        }
        else if (actionObj.action === "queue") {
            switch (actionObj.data.subaction) {
                case "set_shuffle":
                    this.props.queue.setShuffle(actionObj.data.state)
                    break;
                case "set_repeat":
                    this.props.queue.setRepeat(actionObj.data.state)
                    break;
                default:
                    break
            }
        }
    }

    handlePlayerStateChange = (e) => {
        switch (e.data) {
            case window.YT.PlayerState.ENDED:
                this.setState({
                    seeking: false
                })
                this.handleNextSong()
                break
            case window.YT.PlayerState.PAUSED:
                this.setState({
                    paused: true
                })
                break
            case window.YT.PlayerState.PLAYING:
                this.setState({
                    paused: false
                })
                break
            default:
                break
        }
    }

    handleSeek = (value) => {
        this.props.playerAPI.seekTo(value)
        this.setState({
            seeking: false
        })
    }

    handleMoveSlider = (value) => {
        this.setState({
            currentTime: value,
            seeking: true
        })
    }

    handleNextSong = () => {
        this.handleEmitPlayerState("player", "next_song")
        var hasNext = this.props.queue.nextSong()
        if (hasNext) {
            var currentSong = this.props.queue.getCurrentSong()
            this.props.playerAPI.loadVideoById(currentSong._id)
        }
        else {
            this.props.playerAPI.pauseVideo()
            this.props.playerAPI.seekTo(0)
        }
    }

    handlePreviousSong = () => {
        this.handleEmitPlayerState("player", "prev_song")
        var hasPrev = this.props.queue.previousSong()
        if (hasPrev) {
            var currentSong = this.props.queue.getCurrentSong()
            this.props.playerAPI.loadVideoById(currentSong._id)
        }
        else {
            this.props.playerAPI.pauseVideo()
            this.props.playerAPI.seekTo(0)
        }
    }

    handleSetPlay = (val) => {
        if (this.playerAPI.isPaused() !== val) {
            this.handleTogglePlay()
        }
    }

    handleTogglePlay = () => {
        var currentSong
        var hasNext
        var futureQueue

        if (!this.props.playerAPI.isPlayerInit()) { //Initialize on first use
            this.handleEmitPlayerState("player", "play")
            if (this.props.queue.currentSongIsEmpty()) {
                hasNext = this.props.queue.nextSong()
            }
            else {
                hasNext = true
            }

            if (hasNext) {
                currentSong = this.props.queue.getCurrentSong()
                if (this.props.shouldStartSession()) {
                    futureQueue = this.props.queue.getFutureQueue()
                    futureQueue.unshift(currentSong)

                    if (this.props.shouldStartSession()) {
                        this.handleCreateSession()
                    }
                }
                else {
                    this.props.playerAPI.initIFrameAPI(currentSong._id)
                }
            }
            return
        }

        if (this.state.paused) {
            this.handleEmitPlayerState("player", "play")
            if (this.props.queue.currentSongIsEmpty()) {
                hasNext = this.props.queue.nextSong()

                if (hasNext) {
                    currentSong = this.props.queue.getCurrentSong()
                    if (this.props.shouldStartSession()) {
                        futureQueue = this.props.queue.getFutureQueue()
                        futureQueue.unshift(currentSong)

                        if (this.props.shouldStartSession()) {
                            this.handleCreateSession()
                        }
                    }
                    else {
                        this.props.playerAPI.loadVideoById(currentSong._id)
                    }
                }
            }
            else {
                currentSong = this.props.queue.getCurrentSong()
                if (this.props.shouldStartSession()) {
                    futureQueue = this.props.queue.getFutureQueue()
                    futureQueue.unshift(currentSong)

                    if (this.props.shouldStartSession()) {
                        this.handleCreateSession()
                    }
                }
                else {
                    this.props.playerAPI.playVideo()
                }
            }
        }
        else {
            this.handleEmitPlayerState("player", "pause")
            this.props.playerAPI.pauseVideo()
        }
    }

    handleToggleMute = () => {
        if (this.props.playerAPI.isMuted()) {
            this.props.playerAPI.unMute()
        }
        else {
            this.props.playerAPI.mute()
        }
    }

    handleToggleFavorite = (songId) => {
        if (this.state.user.likedSongs.includes(this.state.currentSong._id)) { //Unfavorite song
            this.props.axiosWrapper.axiosPost('/api/removeSongFromFavorites/' + songId, {}, (function(res, data) {
                if (data.success) {
                    this.props.handleUpdateUser(data.data.user)
                }
            }).bind(this), true)
        }
        else { //Favorite song
            this.props.axiosWrapper.axiosPost('/api/addSongToFavorites/' + songId, {}, (function(res, data) {
                if (data.success) {
                    this.props.handleUpdateUser(data.data.user)
                }
            }).bind(this), true)
        }
    }

    handleToggleShuffle = (e) => {
        this.props.queue.toggleShuffle()
        this.handleEmitPlayerState("queue", "shuffle", this.props.queue.getShuffle())
    }

    handleToggleRepeat = (e) => {
        this.props.queue.toggleRepeat()
        this.handleEmitPlayerState("queue", "repeat", this.props.queue.getRepeat())
    }

    getSongProgress = () => {
        var sec = parseInt(this.state.currentTime) % 60
        var min = parseInt(this.state.currentTime / 60)
        return min + ":" + String(sec).padStart(2, '0');
    }

    getSongDuration = () => {
        var sec = parseInt(this.props.playerAPI.getDuration() % 60)
        var min = parseInt(this.props.playerAPI.getDuration() / 60)
        return min + ":" + String(sec).padStart(2, '0');
    }

    getSongImage = () => {
        if (this.state.currentSong.image_high) {
            return this.state.currentSong.image_high;
        }
        else if (this.state.currentSong.image_med) {
            return this.state.currentSong.image_med
        }
        else if (this.state.currentSong.image_std) {
            return this.state.currentSong.image_std
        }
        else if (this.state.currentSong.image) {
            return this.state.currentSong.image
        }
        else {
            return null
        }
    }

    getSongName = () => {
        return this.state.currentSong.name;
    }

    getArtist = () => {
        return this.state.currentSong.creator;
    }

    getPlayButtonIcon = () => {
        return this.state.paused ? icon_play_2 : icon_pause_3;
    }

    getRepeatButtonIcon = () => {
        return this.state.repeat === repeatStates.QUEUE ? icon_repeat_3 : icon_repeat_1;
    }
    
    getRepeatButtonIconClass = () => {
        return this.state.repeat === repeatStates.OFF ? 'player-control-button-icon' : 'player-control-button-icon-on';
    }

    getShuffleButtonIconClass = () => {
        return this.state.shuffle ? 'player-control-button-icon-on' : 'player-control-button-icon';
    }

    getMuteButtonIcon = () => {
        return this.props.playerAPI.isMuted() ? icon_no_sound : icon_volume_up_1;
    }

    getFavoriteButtonIconClass = () => {
        return this.state.user && this.state.user.likedSongs.includes(this.state.currentSong._id) ? 'player-song-favorite-button-icon-on' : 'player-song-favorite-button-icon'
    }

    getPlayerControlsDisabled = () => {
        return !this.isHost()
    }

    getSeekDisabled = () => {
        return !(this.isHost() && this.state.user && this.state.user.privateMode)
    }

    /*
        Is user hosting their own session?
        True, if logged-in user is hosting a live Session, logged-in user is hosting a private Session, or guest user is hosting an offline Session
        False, if logged-in user is participating in a live Session, or guest user is participating in a live Session
    */
    isHost = () => {
        if (this.state.user) { //Logged-in
            if (this.state.user.currentSession) { //In a live Session
                if (this.state.user.hosting) { //Hosting
                    return true 
                }
                else { //Participating
                    return false
                }
            }
            else { //No session
                return true
            }
        }
        else { //Guest
            if (this.props.currentSession) { //In a live Session, participating
                return false
            }
            else {
                return true //Offline session or no session
            }
        }
    }

    render(){
        var title
        var creator
        if (this.state.showTitleTicker) {
            title =  
                    <Ticker speed={6}>
                        {({index}) => (<h1 id="player-song-title-ticker" className="body-text color-contrasted">{this.getSongName()}</h1>)}
                    </Ticker>
        }
        else {
            title = <h1 className="body-text color-contrasted">{this.getSongName()}</h1>
        }

        if (this.state.showCreatorTicker) {
            creator =  
                    <Ticker speed={6}>
                        {({index}) => (<h1 id="player-song-title-ticker" className="body-text color-contrasted">{this.getArtist()}</h1>)}
                    </Ticker>
        }
        else {
            creator = <h1 className="body-text color-contrasted">{this.getArtist()}</h1>
        }
        return(
            <Container id="player-container" fluid>
                <Row>
                    <Col id="player-display">
                        <Row>
                            <Col id="player-song-image-container">
                                <Image id="player-song-image" src={this.getSongImage()} thumbnail/>
                            </Col>
                            <Col id="player-song-title">

                                <div className="fade-single-line-overflow body-text color-contrasted" onMouseEnter={this.handleShowTitleTicker} onMouseLeave={this.handleHideTitleTicker}>
                                    {title}
                                </div>
                                <div className="fade-single-line-overflow body-text color-contrasted" onMouseEnter={this.handleShowCreatorTicker} onMouseLeave={this.handleHideCreatorTicker}>
                                    {creator}
                                </div>
                                {
                                    !this.props.queue.currentSongIsEmpty() && this.state.user ?
                                    <Button id="player-song-favorite-button">
                                        <FavoriteButton className={this.getFavoriteButtonIconClass()} onClick={this.handleToggleFavorite.bind(this, this.state.currentSong._id)} />
                                    </Button> :
                                    <div></div>
                                }
                            </Col>
                        </Row>
                    </Col>
                    <Col id="player-controls">
                        <Row id="player-controls-main-container"> 
                            <Button className="player-control-button" onClick={e => this.handleToggleRepeat(e)} disabled={this.getPlayerControlsDisabled()}>
                                <Image className={this.getRepeatButtonIconClass()} src={this.getRepeatButtonIcon()} roundedCircle/>
                            </Button>
                            <Button className="player-control-button" onClick={e => this.handlePreviousSong(e)} disabled={this.getPlayerControlsDisabled()}>
                                <Image className="player-control-button-icon" src={icon_previous} roundedCircle/>
                            </Button>
                            <Button className="player-control-button" onClick={e => this.handleTogglePlay(e)} disabled={this.getPlayerControlsDisabled()}>
                                <Image className="player-control-button-icon" src={this.getPlayButtonIcon()} roundedCircle/>
                            </Button>
                            <Button className="player-control-button" onClick={e => this.handleNextSong(e)} disabled={this.getPlayerControlsDisabled()}>
                                <Image className="player-control-button-icon" src={icon_next} roundedCircle/>
                            </Button>
                            <Button className="player-control-button" onClick={e => this.handleToggleShuffle(e)} disabled={this.getPlayerControlsDisabled()}>
                                <Image className={this.getShuffleButtonIconClass()} src={icon_shuffle_arrows} roundedCircle/>
                            </Button>
                        </Row>
                        <Row id="player-progress-bar-container">
                            <div className="player-progress-display body-text">{this.getSongProgress()}</div>
                            <RangeSlider className="player-progress-bar" variant="dark" tooltip="off" value={this.state.currentTime} onChange={e => this.handleMoveSlider(e.target.value)} onAfterChange={e => this.handleSeek(e.target.value)} min={0} max={this.props.playerAPI.getDuration()} disabled={this.getSeekDisabled()}/>
                            <div className="player-progress-display body-text">{this.getSongDuration()}</div>
                        </Row>
                    </Col>
                    <Col id="player-volume-container">
                        <Row>
                            <Button id="player-mute-button" className="player-control-button" onClick={e => this.handleToggleMute(e)}>
                                <Image id="player-mute-button-icon" src={this.getMuteButtonIcon()} roundedCircle/>
                            </Button>
                            <div id="player-volume-bar-container">
                                <RangeSlider className="player-volume-bar" variant="dark" tooltip="off" value={this.props.playerAPI.getVolume()} onChange={e => this.props.playerAPI.setVolume(e.target.value)} min={0} max={100}/>
                            </div>
                        </Row>
                    </Col>
                </Row>
            </Container>
        )
    }
}

export default Player;