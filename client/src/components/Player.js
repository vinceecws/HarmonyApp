import React from 'react';
import RangeSlider from 'react-bootstrap-range-slider';
import { Container, Row, Col, Image, Button } from 'react-bootstrap';
import { icon_play_2, icon_pause_3, icon_music_album_3, icon_previous, icon_next, icon_repeat_3, icon_repeat_1, icon_shuffle_arrows, icon_volume_up_1, icon_no_sound, icon_like } from '../graphics';
import { repeatStates } from '../const'
import { genSampleQueue } from '../test/genSamples'
import { song_001_khalid_saturday_nights } from '../test'
const SC = require('soundcloud')
const _ = require('lodash');


class Player extends React.Component{

    constructor(props) {
        super(props)
        var queue = this.fetchQueue()
        var currentSong = queue.shift()
        currentSong.url = song_001_khalid_saturday_nights
        this.fetchAudio(currentSong.url)
        this.audio.volume = 0.5
        this.state = {
            currentSong: currentSong,
            favorited: currentSong.favorited,
            paused: this.audio.paused,
            volume: this.audio.volume * 100,
            muted: this.audio.muted,
            duration: this.audio.duration,
            currentTime: this.audio.currentTime,
            pastQueue: [],
            futureQueue: queue,
            shuffle: false,
            repeat: repeatStates.OFF
        }
    }

    handleSeek = (value) => {
        if(value < this.state.duration) {
            this.audio.currentTime = value
            this.setState({
                currentTime: value
            })
        }
        else { //Play next song

        }
    }

    handleMoveSlider = (value) => {
        this.setState({
            currentTime: value
        })
    }

    handleNextSong = () => {
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

    handlePreviousSong = () => {
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

    handleTogglePlay = () => {
        if (this.audio.paused) {
            this.audio.play()
            this.setState({
                paused: false
            })
        }
        else {
            this.audio.pause()
            this.setState({
                paused: true
            })
        }
    }

    handleToggleRepeat = () => {
        this.setState({
            repeat: this.state.repeat === repeatStates.QUEUE ? repeatStates.OFF : this.state.repeat + 1
        })
    }

    handleToggleShuffle = () => {
        this.setState({
            shuffle: !this.state.shuffle
        })
    }

    handleSetVolume = (value) => {
        this.audio.volume = value / 100
        this.setState({
            volume: value
        })
    }

    handleToggleMute = () => {
        if (this.audio.muted) {
            this.audio.muted = false
            this.setState({
                muted: false
            })
        }
        else {
            this.audio.muted = true
            this.setState({
                muted: true
            })
        }
    }

    /*
        In practice, there will not be a favorited state, 
        and toggleFavorite will simply add/remove the song to/from the user's favorite songs list
    */
    handleToggleFavorite = () => {
        this.setState({
            favorited: !this.state.favorited
        })
    }

    getSongProgress = () => {
        var sec = parseInt(this.state.currentTime) % 60
        var min = parseInt(this.state.currentTime / 60)
        return min + ":" + String(sec).padStart(2, '0');
    }

    getSongDuration = () => {
        var sec = parseInt(this.state.duration % 60)
        var min = parseInt(this.state.duration / 60)
        return min + ":" + String(sec).padStart(2, '0');
    }

    getSongImage = () => {
        return this.state.currentSong.image;
    }

    getSongName = () => {
        return this.state.currentSong.name;
    }

    getArtist = () => {
        return this.state.currentSong.artist;
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
        return this.state.muted ? icon_no_sound : icon_volume_up_1;
    }

    getFavoriteButtonIconClass = () => {
        return this.getFavorite() ? 'player-song-favorite-button-icon-on' : 'player-song-favorite-button-icon'
    }

    /*
        In practice, there will not be a favorited state, 
        and getFavorite will simply check if the song is in the user's favorite songs list
    */
    getFavorite = () => {
        return this.state.favorited;
    }

    fetchQueue = () => {
        return genSampleQueue()
    }

    fetchAudio = (url) => {
        // SC.initialize({
        //     client_id: 'BhajJqlWZTSFOvRxDm5ayVT1DQaJoybO'
        // });
          
        // // stream track id 293
        // SC.resolve('https://soundcloud.com/dengue/menestra')

        this.audio = new Audio(url)
        this.audio.ontimeupdate = (e) => {
            this.setState({
                currentTime: this.audio.currentTime
            })
        }
        this.audio.onloadedmetadata = (e) => {
            this.setState({
                duration: this.audio.duration
            })
        }
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
                            <Button className="player-control-button" onClick={e => this.handleToggleRepeat()}>
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
                            <Button className="player-control-button" onClick={e => this.handleToggleShuffle()}>
                                <Image className={this.getShuffleButtonIconClass()} src={icon_shuffle_arrows} roundedCircle/>
                            </Button>
                        </Row>
                        <Row id="player-progress-bar-container">
                            <div className="player-progress-display body-text">{this.getSongProgress()}</div>
                            <RangeSlider className="player-progress-bar" variant="dark" tooltip="off" value={this.state.currentTime} onChange={e => this.handleMoveSlider(e.target.value)} onAfterChange={e => this.handleSeek(e.target.value)} min={0} max={this.state.duration}/>
                            <div className="player-progress-display body-text">{this.getSongDuration()}</div>
                        </Row>
                    </Col>
                    <Col id="player-volume-container">
                        <Row>
                            <Button id="player-mute-button" className="player-control-button" onClick={e => this.handleToggleMute()}>
                                <Image id="player-mute-button-icon" src={this.getMuteButtonIcon()} roundedCircle/>
                            </Button>
                            <div id="player-volume-bar-container">
                                <RangeSlider className="player-volume-bar" variant="dark" tooltip="off" value={this.state.volume} onChange={e => this.handleSetVolume(e.target.value)} min={0} max={100}/>
                            </div>
                        </Row>
                    </Col>
                </Row>
            </Container>
        )
    }
}

export default Player;