import { repeatStates } from '../../const'
import { icon_profile_image } from '../../graphics';
const _ = require('lodash');

class Queue {

    constructor(pastQueue, futureQueue, currentSong, repeat=repeatStates.OFF, shuffle=false) {
        this._pastQueue = (pastQueue === undefined || pastQueue.length === 0) ? [] : pastQueue
        this._futureQueue = (futureQueue === undefined || futureQueue.length === 0) ? [] : futureQueue
        this._currentSong = currentSong === undefined ? {
            name: "",
            creator: "",
            image: icon_profile_image
        } : currentSong

        this._repeat = repeat
        this._shuffle = shuffle

        this._tempFutureQueue = []
    }

    /*
        Queue States
    */

    getCurrentSong = () => {
        return _.cloneDeep(this._currentSong)
    }

    getPastQueue = () => {
        return _.cloneDeep(this._pastQueue)
    }

    getFutureQueue = () => {
        return _.cloneDeep(this._futureQueue)
    }

    getPastQueueLength = () => {
        return this._pastQueue.length
    }

    getFutureQueueLength = () => {
        return this._futureQueue.length
    }

    getRepeat = () => {
        return this._repeat
    }

    getShuffle = () => {
        return this._shuffle
    }

    /*
        Queue Actions
    */

    /*
        setCurrentSong should only be used when the user performs an action on the queue
        that would result in restarting an entirely new queue, followed by playing a new song.
        Thus, setCurrentSong is typically called right after/in conjunction with clearFutureQueue
    */
    setCurrentSong = (song) => {
        this._currentSong = song
    }

    nextSong = () => {
        if (this._repeat === repeatStates.SONG) {
            return
        }

        if (this._futureQueue.length > 0) {
            this._pastQueue.push(this._currentSong)
            this._currentSong = this._futureQueue.shift()
        }
        else if (this._repeat === repeatStates.QUEUE) {
            this._pastQueue.push(this._currentSong)
            this._currentSong = this._pastQueue.shift()
        }
    }

    previousSong = () => {
        if (this._repeat === repeatStates.SONG) {
            return
        }

        if (this._pastQueue.length > 0) {
            this._futureQueue.unshift(this._currentSong)
            this._currentSong = this._pastQueue.pop()
        }
        else if (this._repeat === repeatStates.QUEUE) {
            this._futureQueue.unshift(this._currentSong)
            this._currentSong = this._futureQueue.pop()
        }
    }

    clearFutureQueue = () => {
        this._futureQueue = []
    }

    moveSongInFutureQueue = (fromIndex, toIndex) => {
        this._futureQueue.splice(toIndex, 0, this._futureQueue.splice(fromIndex, 1)[0])
    }

    addSongToFutureQueue = (song) => {
        this._futureQueue.push(song)
        console.log(this._futureQueue)
    }

    removeSongFromFutureQueue = (index) => {
        this._futureQueue.splice(index, 1)
    }

    toggleRepeat = () => {
        this._repeat = this._repeat === repeatStates.QUEUE ? repeatStates.OFF : this._repeat + 1
    }

    toggleShuffle = () => {
        this._shuffle = !this._shuffle
    }

    /*
        setRepeat and setShuffle should only be used only in special cases where an abnormal state
        transition is necessary, which cannot be achieved using toggle (e.g. repeat-song -> repeat-off),
        and that the developer is well aware of the states before and after calling set
    */
    setRepeat = (val) => {
        this._repeat = val
    }

    setShuffle = (val) => {
        this._shuffle = val
    }
}

export default Queue;