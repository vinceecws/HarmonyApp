import { youtube_iframe_api_src } from '../const'

const loadScript = require('load-script2')

class PlayerAPI {

    constructor(onLoad) {
        this._playerReady = false
        this.onLoad = onLoad
        loadScript(youtube_iframe_api_src)
        window.onYouTubeIframeAPIReady = (() => {
            this.player = new window.YT.Player('yt-player', {
                width: '0',
                height: '0',
                videoId: 'esh8mNoPxGE',
                playerVars: {
                    origin: window.location.origin,
                    autoplay: 1
                },
                events: {
                    onReady: this.onPlayerReady.bind(this),
                    onStateChange: this.onPlayerStateChange.bind(this)
                }
            })
        }).bind(this)
    }

    onPlayerReady = (e) => {
        //BUG IN SAFARI 11 PREVENTS VIDEO FROM PLAYING AT ALL
        this._playerReady = true
        this.onLoad()
    }

    onPlayerStateChange = (e) => {
        
    }

    playVideo = () => {
        if (this._playerReady) {
            this.player.playVideo()
        }
    }

    pauseVideo = () => {
        if (this._playerReady) {
            this.player.pauseVideo()
        }
    }

    seekTo = (time) => {
        if (this._playerReady) {
            this.player.seekTo(time)
        }
    }

    nextVideo = () => {
        if (this._playerReady) {
            this.player.nextVideo()
        }
    }

    previousVideo = () => {
        if (this._playerReady) {
            this.player.previousVideo()
        }
    }

    mute = () => {
        if (this._playerReady) {
            this.player.mute()
        }
    }

    unMute = () => {
        if (this._playerReady) {
            this.player.unMute()
        }
    }

    setVolume = (volume) => {
        if (this._playerReady) {
            this.player.setVolume(volume)
        }
    }

    setLoop = (loop) => {
        if (this._playerReady) {
            this.player.setLoop(loop)
        }
    }

    setShuffle = (shuffle) => {
        if (this._playerReady) {
            this.player.setVolume(shuffle)
        }
    }

    isPaused = () => {
        if (this._playerReady) {
            return this.player.getPlayerState() === window.YT.PlayerState.PAUSED
        }
        return true
    }

    isMuted = () => {
        if (this._playerReady) {
            return this.player.isMuted()
        }
        return false
    }

    getPlayerState = () => {
        if (this._playerReady) {
            return this.player.getPlayerState()
        }
    }

    getPlaylistIndex = () => {
        if (this._playerReady) {
            this.player.getPlaylistIndex()
        }
    }

    getPlaylist = () => {
        if (this._playerReady) {
            this.player.getPlaylist()
        }
    }

    getVolume = () => {
        if (this._playerReady) {
            return this.player.getVolume()
        }
        return 50
    }

    getCurrentTime = () => {
        if (this._playerReady) {
            return parseInt(this.player.getCurrentTime())
        }
        return 0
    }

    getDuration = () => {
        if (this._playerReady) {
            return parseInt(this.player.getDuration())
        }
        return 0
    }
}

export default PlayerAPI;