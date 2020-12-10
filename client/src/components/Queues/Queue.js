import { repeatStates } from '../../const'
const _ = require('lodash');

class ChangeHandler { 
    constructor(event, handler) {
        this.event = event
        this.handler = handler
    }

    setHandler = (handler) => {
        this.handler = handler
    }

    call(...args) {
        this.handler(this.event, ...args)
    }

    destroy() {
        this.handler = null
        return null
    }
}

class Queue {

    constructor(pastQueue, futureQueue, currentSong, repeat=repeatStates.OFF, shuffle=false) {
        this._pastQueue = (pastQueue === undefined || pastQueue.length === 0) ? [] : pastQueue
        this._futureQueue = (futureQueue === undefined || futureQueue.length === 0) ? [] : futureQueue
        this._currentSong = currentSong === undefined ? this.getEmptySong() : currentSong
        this._repeat = repeat
        this._shuffle = shuffle

        this._originalFutureQueue = []

        this.onChange = {
            currentSongChange: [],
            futureQueueChange: [],
            pastQueueChange: [],
            repeatStateChange: [],
            shuffleStateChange: [],
        }
    }

    subscribeToEvent = (event, callback, prepend=false) => {
        if (event in this.onChange) {
            var handler = new ChangeHandler(event, callback)
            if (prepend) {
                this.onChange[event].unshift(handler)
            }
            else {
                this.onChange[event].push(handler)
            }
            return handler
        }
    }

    unsubscribeFromEvent = (event, handler) => {
        if (event in this.onChange) {
            var ind = this.onChange[event].findIndex(x => x == handler)
            if (ind > -1) {
                var handler = this.onChange[event].splice(ind, 1)[0]
                return handler.destroy()
            }
            else {
                return null
            }
        }
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

    getOriginalFutureQueue = () => {
        return _.cloneDeep(this._originalFutureQueue)
    }

    getPastQueueLength = () => {
        return this._pastQueue.length
    }

    getFutureQueueLength = () => {
        return this._futureQueue.length
    }

    getOriginalFutureQueueLength = () => {
        return this._originalFutureQueue.length
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
        this.onChange.currentSongChange.forEach(handler => handler.call(this.getCurrentSong()))
    }

    setPastQueue = (pastQueue) => {
        this._pastQueue = pastQueue
        this.onChange.pastQueueChange.forEach(handler => handler.call(this.getPastQueue()))
    }

    setFutureQueue = (futureQueue) => {
        this._futureQueue = futureQueue
        this.onChange.futureQueueChange.forEach(handler => handler.call(this.getFutureQueue()))
    }

    setOriginalFutureQueue = (originalFutureQueue) => {
        this._originalFutureQueue = originalFutureQueue
    }

    nextSong = () => {
        if (this._repeat === repeatStates.SONG) {
            return true
        }
        if (this._futureQueue.length > 0) {
            this._pastQueue.push(this._currentSong)
            var song = this._futureQueue.shift()
            this.setCurrentSong(song)
            if (this._shuffle) {
                var ind = this._originalFutureQueue.findIndex(x => x._id === song._id)
                this._originalFutureQueue.splice(ind, 1)
            }


            this.onChange.currentSongChange.forEach(handler => handler.call(this.getCurrentSong()))
            this.onChange.futureQueueChange.forEach(handler => handler.call(this.getFutureQueue()))
            this.onChange.pastQueueChange.forEach(handler => handler.call(this.getPastQueue()))

            return true
        }
        else if (this._repeat === repeatStates.QUEUE) {
            this._pastQueue.push(this._currentSong)
            this.setCurrentSong(this._pastQueue.shift())

            this.onChange.currentSongChange.forEach(handler => handler.call(this.getCurrentSong()))
            this.onChange.pastQueueChange.forEach(handler => handler.call(this.getPastQueue()))

            return true
        }

        return false
        
    }

    previousSong = () => {
        if (this._repeat === repeatStates.SONG) {
            return true
        }

        if (this._pastQueue.length > 0) {
            this._futureQueue.unshift(this._currentSong)

            if (this._shuffle) {
                this._originalFutureQueue.unshift(this._currentSong)
            }

            this.setCurrentSong(this._pastQueue.pop())

            this.onChange.currentSongChange.forEach(handler => handler.call(this.getCurrentSong()))
            this.onChange.futureQueueChange.forEach(handler => handler.call(this.getFutureQueue()))
            this.onChange.pastQueueChange.forEach(handler => handler.call(this.getPastQueue()))

            return true
        }
        else if (this._repeat === repeatStates.QUEUE) {
            this._futureQueue.unshift(this._currentSong)

            if (this._shuffle) {
                this._originalFutureQueue.unshift(this._currentSong)
            }

            this.setCurrentSong(this._futureQueue.pop())

            this.onChange.currentSongChange.forEach(handler => handler.call(this.getCurrentSong()))
            this.onChange.futureQueueChange.forEach(handler => handler.call(this.getFutureQueue()))

            return true
        }

        return false
    }

    clearFutureQueue = () => {
        this._futureQueue = []
        
        if (this._shuffle) {
            this.toggleShuffle()
        }
        this.onChange.futureQueueChange.forEach(handler => handler.call(this.getFutureQueue()))
    }

    clearPastQueue = () => {
        this._pastQueue = []
        this.onChange.pastQueueChange.forEach(handler => handler.call(this.getPastQueue()))
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
        this.onChange.futureQueueChange.forEach(handler => handler.call(this.getFutureQueue()))
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
        this.onChange.pastQueueChange.forEach(handler => handler.call(this.getPastQueue()))
        this.onChange.futureQueueChange.forEach(handler => handler.call(this.getFutureQueue()))
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
        this.onChange.futureQueueChange.forEach(handler => handler.call(this.getFutureQueue()))
    }

    removeSongFromFutureQueue = (index) => {
        var song = this._futureQueue.splice(index, 1)

        if (this._shuffle) {
            var ind = this._originalFutureQueue.findIndex(x => x._id === song._id)
            this._originalFutureQueue.splice(ind, 1)
        }
        this.onChange.futureQueueChange.forEach(handler => handler.call(this.getFutureQueue()))
    }

    toggleRepeat = () => {
        this._repeat = this._repeat === repeatStates.QUEUE ? repeatStates.OFF : this._repeat + 1
        this.onChange.repeatStateChange.forEach(handler => handler.call(this.getRepeat()))
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
        this.onChange.shuffleStateChange.forEach(handler => handler.call(this.getShuffle()))
        this.onChange.futureQueueChange.forEach(handler => handler.call(this.getFutureQueue()))
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
        this.onChange.repeatStateChange.forEach(handler => handler.call(this.getRepeat()))
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