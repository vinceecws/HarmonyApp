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

class SessionClient {

    constructor(socket) {
        this.socket = socket
        this.onActions = {
            rcvdChat: [],
            rcvdPlayer: [],
            rcvdQueue: [],
            rcvdSession: []
        }
        this.initSocket()
    }

    initSocket = () => {
        this.socket.on('connect', (socket) => {
            console.log("Connected to Session namespace")
        })

        this.socket.on('disconnect', (socket) => {
            console.log("Disconnected from Session namespace")
        })

        this.socket.onAny((event, ...args) => {
            this.parseAction(event, ...args)
        })
    }

    disconnect = () => {
        this.leaveSession()
        this.socket.disconnect()
    }

    createActionObj = (action, username, userId, data) => {
        return {
            action: action,
            username: username,
            userId: userId,
            data: data
        }
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
        console.log(action);
        console.log(args);
        switch (action) {
            case "chat":
                this.receiveChat(args[0])
                break
            case "player":
                this.receivePlayer(args[0])
                break
            case "queue":
                this.receiveQueue(args[0])
                break
            case "session":
                this.receiveSession(args[0])
                break
            default:
                console.log("Invalid action of " + action)
        }
    }

    receiveChat = (chatObj) => {
        this.onActions.rcvdChat.forEach(handler => handler.call(chatObj))
    }

    receivePlayer = (playerObj) => {
        this.onActions.rcvdPlayer.forEach(handler => handler.call(playerObj))
    }

    receiveQueue = (queueObj) => {
        this.onActions.rcvdQueue.forEach(handler => handler.call(queueObj))
    }

    receiveSession = (sessionObj) => {
        console.log(sessionObj);
        this.onActions.rcvdSession.forEach(handler => handler.call(sessionObj))
    }

    /*
        Action emitters
    */
    readySession = (callback) => {
        console.log("READY SESSION")
        this.socket.emit("ready", (response) => {
            if (response.status === 200) {
                console.log("Session ready")
            }
            
            if (callback) {
                callback(response)
            }
        })
    }
    joinSession = (id, callback) => {
        console.log("JOIN SESSION")
        this.socket.emit("join", id, (response) => {
            if (response.status === 200) {
                console.log("Session joined")
            }
            
            if (callback) {
                callback(response)
            }
        })
    }

    leaveSession = (callback) => {
        this.socket.emit("leave", (response) => {
            if (response.status === 200) {
                console.log("Session joined")
            }
            
            if (callback) {
                callback(response)
            }
        })
    }

    emitChat = (username, userId, data, callback) => {
        var actionObj = this.createActionObj("chat", username, userId, data)
        this.socket.emit("chat", actionObj, (response, chatObj) => {
            if (callback) {
                callback(response, chatObj)
            }
        })
    }

    emitPlayer = (username, userId, data, callback) => {
        var actionObj = this.createActionObj("player", username, userId, data)
        this.socket.emit("player", actionObj, (response, playerObj) => {
            if (callback) {
                callback(response, playerObj)
            }
        })
    }

    emitQueue = (username, userId, data, callback) => {
        var actionObj = this.createActionObj("queue", username, userId, data)
        this.socket.emit("queue", actionObj, (response, queueObj) => {
            if (callback) {
                callback(response, queueObj)
            }
        })
    }

    emitSession = (username, userId, data, callback) => {
        var actionObj = this.createActionObj("session", username, userId, data)
        this.socket.emit("session", actionObj, (response, sessionObj) => {
            if (callback) {
                callback(response, sessionObj)
            }
        })
    }
}

export default SessionClient