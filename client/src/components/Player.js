import React from 'react';
import ReactBootstrapRangeSlider from 'react-bootstrap-range-slider';
import {Container, Row, Col, Image, Button} from 'react-bootstrap';
import {icon_play_1} from '../graphics';

/*
var formData  = new FormData();

formData.append("format", "json");
formData.append("url", "http://soundcloud.com/forss/flickermood");

var html = fetch('http://soundcloud.com/oembed', {
    method: 'POST',
    body: formData
}).then(function (response) {
    return response.json();
}).then(function (res) {
  return res.html;
});
*/

class Player extends React.Component{

    constructor (props) {
        super(props);
    }

    state = {
        currentSong: {url: null, imageUrl: null},
        playing: this.props.playing,
        mute: this.props.mute,
        volume: this.props.volume,
        shuffle: this.props.shuffle,
        repeat: this.props.repeat
    }

    seek = () => {

    }

    nextSong = () => {

    }

    previousSong = () => {

    }

    togglePlay = () => {

    }

    toggleRepeat = () => {

    }

    toggleShuffle = () => {

    }

    setVolume = () => {

    }

    toggleMute = () => {

    }

    toggleFavorite = () => {
    
    }

    getSongImageURL = () => {
        return this.state.currentSong.imageUrl ? this.state.currentSong.imageUrl : icon_play_1;
    }
    
    getSongURL = () => {
        return this.state.currentSong.url;
    }

    render(){
        return(
            <Container>
                <Row>
                    <Col id="player-display">
                        <Image src={this.getSongImageURL()} thumbnail/>
                    </Col>
                    <Col id="player-controls">
                        <Row>
                            <Col>
                                <Row>
                                    <Button>Play</Button>
                                </Row>
                                <Row>
                                    <ReactBootstrapRangeSlider/>
                                </Row>
                            </Col>
                            <Col>
                                <ReactBootstrapRangeSlider/>
                            </Col>
                        </Row>
                    </Col>
                </Row>
            </Container>
        )
    }
}

export default Player;