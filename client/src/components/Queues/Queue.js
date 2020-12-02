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
            this._pastQueue.push(this._currentSong)
            var song = this._futureQueue.shift()
            this.setCurrentSong(song)
            if (this._shuffle) {
                var ind = this._originalFutureQueue.findIndex(x => x._id === song._id)
                this._originalFutureQueue.splice(ind, 1)
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

    /*
        moveSongFromPastQueue allows the manual moving of a song from the past queue to the future queue by the user.
        This is used in Sessions to support replaying an already played song. The function presumes that fromIndex represents
        the index of the target song inside the past queue, while toIndex represents the target index inside the future queue.
        
        Like moveSongInFutureQueue, this function prioritizes user-defined order (e.g. moves made when shuffle is on will be 
        persist even when shuffle is turned off)
    */
    moveSongFromPastQueue = (fromIndex, toIndex) => {
        var song = this._pastQueue.splice(fromIndex, 1)[0]
        this._futureQueue.splice(toIndex, 0, song)

        if (this._shuffle) {
            this._originalFutureQueue.splice(toIndex, 0, song)
        }
    }

    addSongToFutureQueue = (song) => {
        if (this._shuffle) {
            var ind = Math.floor(Math.random() * this._futureQueue.length - 1)
            this._futureQueue.splice(ind, 0, song)
            this._originalFutureQueue.push(song)
            console.log("pushed song to shuffled futureQueue")
        }
        else {
            this._futureQueue.push(song)
            console.log("pushed song to nonshuffled futureQueue")
            console.log(this._futureQueue);
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
        if (!(Object.values(repeatStates).indexOf(val) > -1)) {
            return
        }
        this._repeat = val
    }

    setShuffle = (val) => {
        if (!(val === false || val === true)) {
            return
        }
        if ((this._shuffle && val) || !(this._shuffle || val)) { //If current state is not equal to target state
            return
        }
        else {
            this.toggleShuffle()
        }
    }
}

export default Queue;