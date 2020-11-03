import { youtube_iframe_api_src } from '../const'

const loadScript = require('load-script2')

class PlayerAPI {

    constructor(onLoad, ...args) {
        loadScript(youtube_iframe_api_src)

        this._playerReady = false

        if (typeof window.onYouTubeIframeAPIReady !== 'function') {
            window.onYouTubeIframeAPIReady = () => {
                this.player = new window.YT.Player('yt-player', {
                    width: '0',
                    height: '0',
                    //videoId: 'q2zj74iK1MI',
                    playerVars: {
                        origin: window.location.origin,
                        autoplay: 1
                    },
                    events: {
                        onReady: this.onPlayerReady,
                        onStateChange: this.onPlayerStateChange
                    }
                })
                onLoad(...args)
            }
        }
    }

    onPlayerReady = (e) => {
        //BUG IN SAFARI 11 PREVENTS VIDEO FROM PLAYING AT ALL
        this._playerReady = true
    }

    onPlayerStateChange = (e) => {
        
    }

    isPaused = () => {
        if (this._playerReady) {
            return this.player.getPlayerState() === window.YT.PlayerStates.PAUSED
        }
        return true
    }

    isMuted = () => {
        if (this._playerReady) {
            return this.player.isMuted()
        }
        return false
    }

    getVolume = () => {
        if (this._playerReady) {
            return this.player.getVolume()
        }
        return 50
    }

    getCurrentTime = () => {
        if (this._playerReady) {
            return this.player.getCurrentTime()
        }
        return 0
    }

    getDuration = () => {
        if (this.state.playerReady) {
            return this.player.getDuration()
        }
        return 0
    }

}

export default PlayerAPI;