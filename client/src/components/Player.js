import React from 'react';
import RangeSlider from 'react-bootstrap-range-slider';
import { Container, Row, Col, Image, Button } from 'react-bootstrap';
import { icon_play_2, icon_pause_3, icon_previous, icon_next, icon_repeat_3, icon_repeat_1, icon_shuffle_arrows, icon_volume_up_1, icon_no_sound, icon_like } from '../graphics';
import { repeatStates } from '../const'


class Player extends React.Component{

    constructor(props) {
        super(props)

        this.state = {
            currentSong: this.props.queue.getCurrentSong(),
            currentTime: this.props.playerAPI.getCurrentTime()
        }
    }

    componentDidMount = () => {
        this.props.playerAPI.subscribeToEvent("onPlayerStateChange", this.handlePlayerStateChange.bind(this))
        setInterval(() => {
            this.setState({
                currentSong: this.props.queue.getCurrentSong(),
                currentTime: this.props.playerAPI.getCurrentTime() 
            })
        }, 1000)
    }

    componentWillUnmount = () => {
        this.props.playerAPI.unsubscribeFromEvent("onPlayerStateChange")
    }

    handleGoToItem = (e) => {
        
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
        if (currentSong.id !== "") {
            this.props.playerAPI.loadVideoById(currentSong.id)
        }
        else {
            this.props.playerAPI.stopVideo()
        }
    }

    handlePreviousSong = () => {
        this.props.queue.previousSong()
        var currentSong = this.props.queue.getCurrentSong()
        if (currentSong.id !== "") {
            this.props.playerAPI.loadVideoById(currentSong.id)
        }
    }

    handleTogglePlay = () => {
        if (this.props.playerAPI.isPlayerInit() === false) { //Initialize on first use
            if (this.props.queue.currentSongIsEmpty()) {
                this.props.queue.nextSong()
            }

            if (!this.props.queue.currentSongIsEmpty()) {
                var currentSong = this.props.queue.getCurrentSong()
                this.props.playerAPI.initIFrameAPI(currentSong.id)
            }
            return
        }

        if (this.props.playerAPI.isPaused()) {
            if (this.props.queue.currentSongIsEmpty()) {
                this.props.queue.nextSong()

                var currentSong = this.props.queue.getCurrentSong()
                if (currentSong != null) {
                    this.props.playerAPI.loadVideoById(currentSong.id)
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

    /*
        In practice, there will not be a favorited state, 
        and toggleFavorite will simply add/remove the song to/from the user's favorite songs list
    */
    handleToggleFavorite = () => {
        
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
        return this.state.currentSong.image;
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
        return this.props.isFavorited() ? 'player-song-favorite-button-icon-on' : 'player-song-favorite-button-icon'
    }

    render(){
        return(
            <Container id="player-container" fluid>
                <Row>
                    <Col id="player-display">
                        <Row>
                            <Col id="player-song-image-container">
                                <Image id="player-song-image" src={this.getSongImage()} thumbnail/>
                            </Col>
                            <Col id="player-song-title">
                                <div className="body-text color-contrasted">{this.getSongName()}</div>
                                <div className="body-text color-contrasted">{this.getArtist()}</div>
                                <Button id="player-song-favorite-button">
                                    <Image className={this.getFavoriteButtonIconClass()} src={icon_like} onClick={e => this.handleToggleFavorite()} roundedCircle/>
                                </Button>
                            </Col>
                        </Row>
                    </Col>
                    <Col id="player-controls">
                        <Row id="player-controls-main-container"> 
                            <Button className="player-control-button" onClick={e => this.props.queue.toggleRepeat()}>
                                <Image className={this.getRepeatButtonIconClass()} src={this.getRepeatButtonIcon()} roundedCircle/>
                            </Button>
                            <Button className="player-control-button" onClick={e => this.handlePreviousSong()}>
                                <Image className="player-control-button-icon" src={icon_previous} roundedCircle/>
                            </Button>
                            <Button className="player-control-button" onClick={e => this.handleTogglePlay()}>
                                <Image className="player-control-button-icon" src={this.getPlayButtonIcon()} roundedCircle/>
                            </Button>
                            <Button className="player-control-button" onClick={e => this.handleNextSong()}>
                                <Image className="player-control-button-icon" src={icon_next} roundedCircle/>
                            </Button>
                            <Button className="player-control-button" onClick={e => this.props.queue.toggleShuffle()}>
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
                            <Button id="player-mute-button" className="player-control-button" onClick={e => this.handleToggleMute()}>
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