import { repeatStates } from '../../const'
import { icon_profile_image } from '../../graphics';
const _ = require('lodash');

class Queue {

    constructor(pastQueue, futureQueue, currentSong, repeat=repeatStates.OFF, shuffle=false) {
        this._pastQueue = (pastQueue === undefined || pastQueue.length === 0) ? [] : pastQueue
        this._futureQueue = (futureQueue === undefined || futureQueue.length === 0) ? [] : futureQueue
        this._currentSong = currentSong === undefined ? this.getEmptySong() : currentSong
        this._repeat = repeat
        this._shuffle = shuffle

        this._tempFutureQueue = []
    }

    /*
        Queue States
    */

    getEmptySong = () => {
        return {
            id: "",
            type: "song",
            name: "",
            creatorId: "",
            creator: "",
            image: icon_profile_image
        }
    }

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
        else {
            this._pastQueue.push(this._currentSong)
            this._currentSong = this.getEmptySong()
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
    }

    removeSongFromFutureQueue = (index) => {
        this._futureQueue.splice(index, 1)
    }

    toggleRepeat = () => {
        this._repeat = this._repeat === repeatStates.QUEUE ? repeatStates.OFF : this._repeat + 1
    }


    //Need to implement handling for song ended
    toggleShuffle = () => {
        this._shuffle = !this._shuffle
        if (this._shuffle) {

            this._tempFutureQueue = _.cloneDeep(this._futureQueue)
            /* Fisher-Yates shuffle from https://medium.com/@nitinpatel_20236/how-to-shuffle-correctly-shuffle-an-array-in-javascript-15ea3f84bfb */
            for (let i = this._tempFutureQueue.length - 1; i > 0; i--){
                const j = Math.floor(Math.random() * i)
                const temp = this._tempFutureQueue[i]
                this._tempFutureQueue[i] = this._tempFutureQueue[j]
                this._tempFutureQueue[j] = temp
            }
        }
        else {
            this._tempFutureQueue = []
        }
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