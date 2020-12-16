import { youtube_iframe_api_src } from '../const'

const loadScript = require('load-script2')

class PlayerAPI {

    constructor() {
        this._playerReady = false
        this._playerBuffering = false
        this._bufferQueue = []
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
        this._playerBuffering = false
        this._playerReady = true
        //Flush buffer queue and break if player is buffering again
        while (this._bufferQueue.length > 0 && !this._playerBuffering) {
            this._bufferQueue.shift()()
        }

        this.player.playVideo()
        if (this.subscribedEvents.onPlayerReady) {
            this.subscribedEvents.onPlayerReady(e)
        }
    }

    onPlayerStateChange = (e) => {
        if (e.data === window.YT.PlayerState.UNSTARTED || e.data === window.YT.PlayerState.BUFFERING) {
            this._playerBuffering = true
        }
        else {
            this._playerBuffering = false
            //Flush buffer queue and break if player is buffering again
            while (this._bufferQueue.length > 0 && !this._playerBuffering) {
                this._bufferQueue.shift()()
            }
        }

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
            this._playerBuffering = true
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
        if (!this._playerBuffering && this._playerReady && this.player) {
            this._playerBuffering = true
            this.player.loadVideoById(id)
            this.player.playVideo()
        }
        else if (this._playerBuffering) {
            this._bufferQueue.push(this.loadVideoById.bind(this, id, true))
        }
    }

    playVideo = () => {
        if (!this._playerBuffering && this._playerReady && this.player) {
            this._playerBuffering = true
            this.player.playVideo()
        }
        else if (this._playerBuffering) {
            this._bufferQueue.push(this.playVideo)
        }
    }

    pauseVideo = () => {
        if (!this._playerBuffering && this._playerReady && this.player) {
            this.player.pauseVideo()
        }
        else if (this._playerBuffering) {
            this._bufferQueue.push(this.pauseVideo)
        }
    }

    stopVideo = () => {
        if (!this._playerBuffering && this._playerReady && this.player) {
            this.player.stopVideo()
        }
        else if (this._playerBuffering) {
            this._bufferQueue.push(this.stopVideo)
        }
    }

    seekTo = (time) => {
        if (!this._playerBuffering && this._playerReady && this.player) {
            if (!this.isPaused()) {
                this._playerBuffering = true //YT Player API does not change state if seeking is done during pause
            }
            this.player.seekTo(time)
        }
        else if (this._playerBuffering) {
            this._bufferQueue.push(this.seekTo.bind(this, time))
        }
    }

    nextVideo = () => {
        if (!this._playerBuffering && this._playerReady && this.player) {
            this._playerBuffering = true
            this.player.nextVideo()
        }
        else if (this._playerBuffering) {
            this._bufferQueue.push(this.nextVideo)
        }
    }

    previousVideo = () => {
        if (!this._playerBuffering && this._playerReady && this.player) {
            this._playerBuffering = true
            this.player.previousVideo()
        }
        else if (this._playerBuffering) {
            this._bufferQueue.push(this.previousVideo)
        }
    }

    mute = () => {
        if (!this._playerBuffering && this._playerReady && this.player) {
            this.player.mute()
        }
        else if (this._playerBuffering) {
            this._bufferQueue.push(this.mute)
        }
    }

    unMute = () => {
        if (!this._playerBuffering && this._playerReady && this.player) {
            this.player.unMute()
        }
        else if (this._playerBuffering) {
            this._bufferQueue.push(this.unMute)
        }
    }

    setVolume = (volume) => {
        if (!this._playerBuffering && this._playerReady && this.player) {
            this.player.setVolume(volume)
        }
        else if (this._playerBuffering) {
            this._bufferQueue.push(this.setVolume.bind(this, volume))
        }
    }

    setLoop = (loop) => {
        if (!this._playerBuffering && this._playerReady && this.player) {
            this.player.setLoop(loop)
        }
        else if (this._playerBuffering) {
            this._bufferQueue.push(this.setLoop.bind(this, loop))
        }
    }

    setShuffle = (shuffle) => {
        if (!this._playerBuffering && this._playerReady && this.player) {
            this.player.setShuffle(shuffle)
        }
        else if (this._playerBuffering) {
            this._bufferQueue.push(this.setShuffle.bind(this, shuffle))
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
        if (this._playerReady && this.player) {
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