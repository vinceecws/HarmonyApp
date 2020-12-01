import React from 'react';
import Ticker from 'react-ticker';
import RangeSlider from 'react-bootstrap-range-slider';
import { Container, Row, Col, Image, Button } from 'react-bootstrap';
import { icon_play_2, icon_pause_3, icon_previous, icon_next, icon_repeat_3, icon_repeat_1, icon_shuffle_arrows, icon_volume_up_1, icon_no_sound } from '../graphics';
import { ReactComponent as FavoriteButton } from '../graphics/music_player_pack/035-like.svg'
import { repeatStates } from '../const'


class Player extends React.Component {

    constructor(props) {
        super(props)
        this.state = {
            user: this.props.user,
            showTitleTicker: false,
            currentSong: this.props.queue.getCurrentSong(),
            currentTime: this.props.playerAPI.getCurrentTime()
        }
    }

    componentDidMount = () => {
        this.playerActionListener = this.props.sessionClient.subscribeToAction("player", this.handleUpdatePlayerState.bind(this))
        this.queueActionListener = this.props.sessionClient.subscribeToAction("queue", this.handleUpdatePlayerState.bind(this))
        this.props.playerAPI.subscribeToEvent("onPlayerStateChange", this.handlePlayerStateChange.bind(this))
        setInterval(() => {
            this.setState({
                currentSong: this.props.queue.getCurrentSong(),
                currentTime: this.props.playerAPI.getCurrentTime() 
            })
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
        this.playerActionListener = this.props.sessionClient.unsubscribeFromAction("player", this.playerActionListener)
        this.queueActionListener = this.props.sessionClient.unsubscribeFromAction("queue", this.queueActionListener)
        this.props.playerAPI.unsubscribeFromEvent("onPlayerStateChange")
    }

    handleGoToItem = (e) => {
        
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

    handleUpdatePlayerState = (actionObj) => {
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
        if (actionObj.action === "queue") {
            switch (actionObj.data.subaction) {
                case "set_shuffle":
                    this.props.queue.setShuffle(actionObj.data.state)
                case "set_repeat":
                    this.props.queue.setRepeat(actionObj.data.state)
                default:
                    break
            }
        }
    }

    handlePlayerStateChange = (e) => {
        if (e.data === window.YT.PlayerState.ENDED) {
            this.handleNextSong()
        }
    }

    handleSeek = (value) => {
        this.props.playerAPI.seekTo(value)
    }

    handleMoveSlider = (value) => {
        this.setState({
            currentTime: value
        })
    }

    handleNextSong = () => {
        this.props.queue.nextSong()
        var currentSong = this.props.queue.getCurrentSong()
        if (currentSong._id !== "") {
            this.props.playerAPI.loadVideoById(currentSong._id)
        }
        else {
            this.props.playerAPI.stopVideo()
        }
    }

    handlePreviousSong = () => {
        this.props.queue.previousSong()
        var currentSong = this.props.queue.getCurrentSong()
        if (currentSong._id !== "") {
            this.props.playerAPI.loadVideoById(currentSong._id)
        }
    }

    handleSetPlay = (val) => {
        if (this.playerAPI.isPaused() !== val) {
            this.handleTogglePlay()
        }
    }

    handleTogglePlay = () => {
        var currentSong
        if (!this.props.playerAPI.isPlayerInit()) { //Initialize on first use
            if (this.props.queue.currentSongIsEmpty()) {
                this.props.queue.nextSong()
            }

            if (!this.props.queue.currentSongIsEmpty()) {
                currentSong = this.props.queue.getCurrentSong()
                this.props.playerAPI.initIFrameAPI(currentSong._id)
            }
            return
        }

        if (this.props.playerAPI.isPaused()) {
            if (this.props.queue.currentSongIsEmpty()) {
                this.props.queue.nextSong()

                currentSong = this.props.queue.getCurrentSong()
                if (currentSong != null) {
                    this.props.playerAPI.loadVideoById(currentSong._id)
                }
            }
            else {
                this.props.playerAPI.playVideo()
            }
        }
        else {
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
        return this.props.playerAPI.isPaused() ? icon_play_2 : icon_pause_3;
    }

    getRepeatButtonIcon = () => {
        return this.props.queue.getRepeat() === repeatStates.QUEUE ? icon_repeat_3 : icon_repeat_1;
    }
    
    getRepeatButtonIconClass = () => {
        return this.props.queue.getRepeat() === repeatStates.OFF ? 'player-control-button-icon' : 'player-control-button-icon-on';
    }

    getShuffleButtonIconClass = () => {
        return this.props.queue.getShuffle() ? 'player-control-button-icon-on' : 'player-control-button-icon';
    }

    getMuteButtonIcon = () => {
        return this.props.playerAPI.isMuted() ? icon_no_sound : icon_volume_up_1;
    }

    getFavoriteButtonIconClass = () => {
        return this.state.user && this.state.user.likedSongs.includes(this.state.currentSong._id) ? 'player-song-favorite-button-icon-on' : 'player-song-favorite-button-icon'
    }

    render(){
        let entry =  <div><Ticker speed={8}>
                        {({index}) => (<h1 className="body-text color-contrasted">{this.getSongName()}</h1>)}
                     </Ticker></div>;
        return(
            <Container id="player-container" fluid>
                <Row>
                    <Col id="player-display">
                        <Row>
                            <Col id="player-song-image-container">
                                <Image id="player-song-image" src={this.getSongImage()} thumbnail/>
                            </Col>
                            <Col id="player-song-title">

                                <div className="fade-single-line-overflow" onMouseEnter={this.handleShowTitleTicker} onMouseLeave={this.handleHideTitleTicker}>
                                        {entry}
                                </div>
                                <div className="fade-single-line-overflow body-text color-contrasted">{this.getSongName()}</div>
                                <div className="fade-single-line-overflow tiny-text color-contrasted">{this.getArtist()}</div>
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
                            <Button className="player-control-button" onClick={e => this.props.queue.toggleRepeat(e)}>
                                <Image className={this.getRepeatButtonIconClass()} src={this.getRepeatButtonIcon()} roundedCircle/>
                            </Button>
                            <Button className="player-control-button" onClick={e => this.handlePreviousSong(e)}>
                                <Image className="player-control-button-icon" src={icon_previous} roundedCircle/>
                            </Button>
                            <Button className="player-control-button" onClick={e => this.handleTogglePlay(e)}>
                                <Image className="player-control-button-icon" src={this.getPlayButtonIcon()} roundedCircle/>
                            </Button>
                            <Button className="player-control-button" onClick={e => this.handleNextSong(e)}>
                                <Image className="player-control-button-icon" src={icon_next} roundedCircle/>
                            </Button>
                            <Button className="player-control-button" onClick={e => this.props.queue.toggleShuffle(e)}>
                                <Image className={this.getShuffleButtonIconClass()} src={icon_shuffle_arrows} roundedCircle/>
                            </Button>
                        </Row>
                        <Row id="player-progress-bar-container">
                            <div className="player-progress-display body-text">{this.getSongProgress()}</div>
                            <RangeSlider className="player-progress-bar" variant="dark" tooltip="off" value={this.state.currentTime} onChange={e => this.handleMoveSlider(e.target.value)} onAfterChange={e => this.handleSeek(e.target.value)} min={0} max={this.props.playerAPI.getDuration()}/>
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