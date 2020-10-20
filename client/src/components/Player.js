import React from 'react';
import ReactBootstrapRangeSlider from 'react-bootstrap-range-slider';

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
        currentSong: this.props.currentSong,
        playing: this.props.playing,

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

    getSongImageURL = () => {
        return this.state.currentSong.url;
    }
    
    getSongURL = () => {
        return this.state.currentSong.imageUrl;
    }
    
    addSongToFavorites = () => {
    
    }

    render(){
        return(
            <div>
                <div id="player-display">

                </div>
                <div id="player-controls">

                </div>
            </div>
        )
    }
}

export default Player;