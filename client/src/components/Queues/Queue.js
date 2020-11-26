import { repeatStates } from '../../const'
const _ = require('lodash');

class Queue {

    constructor(pastQueue, futureQueue, currentSong, repeat=repeatStates.OFF, shuffle=false) {
        this._pastQueue = (pastQueue === undefined || pastQueue.length === 0) ? [] : pastQueue
        this._futureQueue = (futureQueue === undefined || futureQueue.length === 0) ? [] : futureQueue
        this._currentSong = currentSong === undefined ? this.getEmptySong() : currentSong
        this._repeat = repeat
        this._shuffle = shuffle

        this._originalFutureQueue = []
    }

    /*
        Queue States
    */

    currentSongIsEmpty = () => {
        return this._currentSong._id === ""
    }

    getEmptySong = () => {
        return {
            _id: "",
            type: "song",
            name: "",
            creatorId: "",
            creator: "",
            image: null
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
            console.log(this._futureQueue)
            console.log(this._originalFutureQueue)
            this._pastQueue.push(this._currentSong)
            var song = this._futureQueue.shift()
            this.setCurrentSong(song)
            console.log(song)

            if (this._shuffle) {
                var ind = this._originalFutureQueue.findIndex(x => x._id === song._id)
                console.log(this._originalFutureQueue.splice(ind, 1)[0])
            }
        }
        else if (this._repeat === repeatStates.QUEUE) {
            this._pastQueue.push(this._currentSong)
            this.setCurrentSong(this._pastQueue.shift())
        }
        else {
            this._pastQueue.push(this._currentSong)
            this.setCurrentSong(this.getEmptySong())
        }
        
    }

    previousSong = () => {
        if (this._repeat === repeatStates.SONG) {
            return
        }

        if (this._pastQueue.length > 0) {
            this._futureQueue.unshift(this._currentSong)

            if (this._shuffle) {
                this._originalFutureQueue.unshift(this._currentSong)
            }

            this.setCurrentSong(this._pastQueue.pop())
        }
        else if (this._repeat === repeatStates.QUEUE) {
            this._futureQueue.unshift(this._currentSong)

            if (this._shuffle) {
                this._originalFutureQueue.unshift(this._currentSong)
            }

            this.setCurrentSong(this._futureQueue.pop())
        }
    }

    clearFutureQueue = () => {
        this._futureQueue = []
        
        if (this._shuffle) {
            this.toggleShuffle()
        }
    }

    /*
        moveSongInFutureQueue prioritizes user-defined order, therefore, changes in order made in shuffle mode
        is expected to persist even when shuffle is turned off. However, note that the converse is not true.
    */
    moveSongInFutureQueue = (fromIndex, toIndex) => { 
        var song = this._futureQueue.splice(fromIndex, 1)[0]
        this._futureQueue.splice(toIndex, 0, song)

        if (this._shuffle) {
            var ind = this._originalFutureQueue.findIndex(x => x._id === song._id)
            this._originalFutureQueue.splice(toIndex, 0, this._originalFutureQueue.splice(ind, 1)[0])
        }
    }

    addSongToFutureQueue = (song) => {
        if (this._shuffle) {
            var ind = Math.floor(Math.random() * this._futureQueue.length - 1)
            this._futureQueue.splice(ind, 0, song)
            this._originalFutureQueue.push(song)
        }
        else {
            this._futureQueue.push(song)
        }
    }

    removeSongFromFutureQueue = (index) => {
        var song = this._futureQueue.splice(index, 1)

        if (this._shuffle) {
            var ind = this._originalFutureQueue.findIndex(x => x._id === song._id)
            this._originalFutureQueue.splice(ind, 1)
        }
    }

    toggleRepeat = () => {
        this._repeat = this._repeat === repeatStates.QUEUE ? repeatStates.OFF : this._repeat + 1
    }


    toggleShuffle = () => {
        this._shuffle = !this._shuffle
        if (this._shuffle) {
            this._originalFutureQueue = _.cloneDeep(this._futureQueue)
            /* Fisher-Yates shuffle from https://medium.com/@nitinpatel_20236/how-to-shuffle-correctly-shuffle-an-array-in-javascript-15ea3f84bfb */
            for (let i = this._futureQueue.length - 1; i > 0; i--){
                const j = Math.floor(Math.random() * i)
                const temp = this._futureQueue[i]
                this._futureQueue[i] = this._futureQueue[j]
                this._futureQueue[j] = temp
            }
        }
        else {
            this._futureQueue = this._originalFutureQueue
            this._originalFutureQueue = []
        }
    }

    /*
        setRepeat should only be used only in special cases where an abnormal state
        transition is necessary, which cannot be achieved using toggle (e.g. repeat-song -> repeat-off),
        and that the developer is well aware of the states before and after calling set
    */
    setRepeat = (val) => {
        this._repeat = val
    }
}

export default Queue;