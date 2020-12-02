import { youtube_iframe_api_src } from '../const'

const loadScript = require('load-script2')

class PlayerAPI {

    constructor() {
        this._playerReady = false
        this.script = null
        this.player = null
        this.subscribedEvents = {
            onPlayerReady: null,
            onPlayerStateChange: null,
            onPlayerPlaybackQualityChange: null,
            onPlayerPlaybackRateChange: null,
            onPlayerError: null,
            onPlayerApiChange: null
        }
    }

    subscribeToEvent = (event, subscriber) => {
        if (event in this.subscribedEvents) {
            this.subscribedEvents[event] = subscriber
        }
    }

    unsubscribeFromEvent = (event) => {
        this.subscribedEvents[event] = null
    }

    onPlayerReady = (e) => { //Called when initial player is loaded
        this._playerReady = true
        this.player.playVideo()
        if (this.subscribedEvents.onPlayerReady) {
            this.subscribedEvents.onPlayerReady(e)
        }
    }

    onPlayerStateChange = (e) => {
        if (this.subscribedEvents.onPlayerStateChange) {
            this.subscribedEvents.onPlayerStateChange(e)
        }
    }

    onPlayerPlaybackQualityChange = (e) => {
        if (this.subscribedEvents.onPlayerPlaybackQualityChange) {
            this.subscribedEvents.onPlayerPlaybackQualityChange(e)
        }
    }

    onPlayerPlaybackRateChange = (e) => {
        if (this.subscribedEvents.onPlayerPlaybackRateChange) {
            this.subscribedEvents.onPlayerPlaybackRateChange(e)
        }
    }

    onPlayerError = (e) => {
        if (this.subscribedEvents.onPlayerError) {
            this.subscribedEvents.onPlayerError(e)
        }
    }

    onPlayerApiChange = (e) => {
        if (this.subscribedEvents.onPlayerApiChange) {
            this.subscribedEvents.onPlayerApiChange(e)
        }
    }

    isPlayerInit = () => {
        return !!this.player
    }

    initIFrameAPI = (id) => {
        if (!this.player) {
            if (!this.script) {
                this.script = loadScript(youtube_iframe_api_src)
                window.onYouTubeIframeAPIReady = (() => {
                    this.player = new window.YT.Player('yt-player', {
                        videoId: id,
                        playerVars: {
                            origin: window.location.origin,
                            autoplay: 1,
                            enablejsapi: 1
                        },
                        events: {
                            onReady: this.onPlayerReady.bind(this),
                            onStateChange: this.onPlayerStateChange.bind(this),
                            onPlaybackQualityChange: this.onPlayerPlaybackQualityChange.bind(this),
                            onPlaybackRateChange: this.onPlayerPlaybackRateChange.bind(this),
                            onError: this.onPlayerError.bind(this),
                            onApiChange: this.onPlayerApiChange.bind(this)
                        }
                    })
                })
            }
            else {
                this.player = new window.YT.Player('yt-player', {
                    videoId: id,
                    playerVars: {
                        origin: window.location.origin,
                        autoplay: 1,
                        enablejsapi: 1
                    },
                    events: {
                        onReady: this.onPlayerReady.bind(this),
                        onStateChange: this.onPlayerStateChange.bind(this),
                        onPlaybackQualityChange: this.onPlayerPlaybackQualityChange.bind(this),
                        onPlaybackRateChange: this.onPlayerPlaybackRateChange.bind(this),
                        onError: this.onPlayerError.bind(this),
                        onApiChange: this.onPlayerApiChange.bind(this)
                    }
                })
            }
        }
    }

    destroyIFrameAPI = () => {
        if (this.player) {
            this.player.destroy()
            this.player = null
            this._playerReady = false
        }
        return null
    }

    loadVideoById = (id) => {
        if (this.player) {
            this.player.loadVideoById(id)
            this.player.playVideo()
        }
    }

    playVideo = () => {
        if (this._playerReady && this.player) {
            this.player.playVideo()
        }
    }

    pauseVideo = () => {
        if (this._playerReady && this.player) {
            this.player.pauseVideo()
        }
    }

    stopVideo = () => {
        if (this._playerReady && this.player) {
            this.player.stopVideo()
        }
    }

    seekTo = (time) => {
        if (this._playerReady && this.player) {
            this.player.seekTo(time)
        }
    }

    nextVideo = () => {
        if (this._playerReady && this.player) {
            this.player.nextVideo()
        }
    }

    previousVideo = () => {
        if (this._playerReady && this.player) {
            this.player.previousVideo()
        }
    }

    mute = () => {
        if (this._playerReady && this.player) {
            this.player.mute()
        }
    }

    unMute = () => {
        if (this._playerReady && this.player) {
            this.player.unMute()
        }
    }

    setVolume = (volume) => {
        if (this._playerReady && this.player) {
            this.player.setVolume(volume)
        }
    }

    setLoop = (loop) => {
        if (this._playerReady && this.player) {
            this.player.setLoop(loop)
        }
    }

    setShuffle = (shuffle) => {
        if (this._playerReady && this.player) {
            this.player.setVolume(shuffle)
        }
    }

    isPaused = () => {
        if (this._playerReady && this.player) {
            return this.player.getPlayerState() === window.YT.PlayerState.PAUSED
        }
        return true
    }

    isMuted = () => {
        if (this._playerReady && this.player) {
            return this.player.isMuted()
        }
        return false
    }

    getPlayerState = () => {
        if (this._playerReady && this.player) {
            return this.player.getPlayerState()
        }
    }

    getPlaylistIndex = () => {
        if (this._playerReady && this.player) {
            this.player.getPlaylistIndex()
        }
    }

    getPlaylist = () => {
        if (this._playerReady) {
            this.player.getPlaylist()
        }
    }

    getVolume = () => {
        if (this._playerReady && this.player) {
            return this.player.getVolume()
        }
        return 50
    }

    getCurrentTime = () => {
        if (this._playerReady && this.player) {
            return parseInt(this.player.getCurrentTime())
        }
        return 0
    }

    getDuration = () => {
        if (this._playerReady && this.player) {
            return parseInt(this.player.getDuration())
        }
        return 0
    }
}

export default PlayerAPI;