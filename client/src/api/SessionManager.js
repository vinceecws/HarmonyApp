class ActionHandler { 
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

class SessionManager {

    constructor(socket) {
        this.socket = socket
        this.onActions = {
            rcvdTopSessions: []
        }
        this.initSocket()
    }

    initSocket = () => {
        this.socket.on('connect', (socket) => {
            console.log("Connected to Main namespace")
        })

        this.socket.on('disconnect', (socket) => {
            console.log("Disconnected from Main namespace")
        })

        this.socket.onAny((event, ...args) => {
            this.parseAction(event, ...args)
        })
    }

    disconnect = () => {
        this.socket.disconnect()
    }

    subscribeToAction = (action, callback, prepend=false) => {
        if (action in this.onActions) {
            var handler = new ActionHandler(action, callback)
            if (prepend) {
                this.onActions[action].unshift(handler)
            }
            else {
                this.onActions[action].push(handler)
            }
            return handler
        }
    }

    unsubscribeFromAction = (action, handler) => {
        if (action in this.onActions) {
            var ind = this.onActions[action].findIndex(x => x == handler)
            if (ind > -1) {
                var handler = this.onActions[action].splice(ind, 1)[0]
                return handler.destroy()
            }
            else {
                return null
            }
        }
    }

    /*
        Action receivers
    */
    parseAction = (action, ...args) => {
        switch (action) {
            case "top-sessions":
                this.receiveTopSessions(args[0])
                break
            default:
                console.log("Invalid action of " + action)
        }
    }

    receiveTopSessions = (sessions) => {
        this.onActions.rcvdTopSessions.forEach(handler => handler.call(sessions))
    }

    emitGetTopSessions = () => {
        this.socket.emit('get-top-sessions')
    }
}

export default SessionManager