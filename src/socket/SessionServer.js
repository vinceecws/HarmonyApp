const mongooseQuery = require('../db');

class SessionServer {

    constructor(socket) {
        this.socket = socket
        this.initSocket()
    }

    initSocket = () => {
        this.socket.on('connect', async (socket) => {
            /* Access equivalent of PassportJS's "req.user" here as "socket.request.user" */

            socket.onAny((event, ...args) => {
                this.parseAction(event, socket, ...args)
            })
        })
    }

    parseAction = (action, clientSocket, ...args) => {
        switch (action) {
            case "join":
                this.joinSession(clientSocket, args[0])
                break
            case "leave":
                this.leaveSession(clientSocket, args[0])
                break
            case "chat":
                this.emitChat(clientSocket, args[0])
                break
            case "player":
                this.emitPlayer(clientSocket, args[0])
                break
            case "queue":
                this.emitQueue(clientSocket, args[0])
                break
            case "session":
                this.emitSession(clientSocket, args[0])
                break
            case 'like':
                break;
            default:
                console.log("Invalid action")
        }
    }

    createActionObj = (action, username, userId, data) => {
        return {
            action: action,
            timestamp: Date.now(),
            username: username,
            userId: userId,
            data: data
        }
    }

    updateSessionState = async (sessionId, actionObj) => {
        mongooseQuery.updateSession(sessionId, {
                $push: {
                    actionLog: actionObj
                }
        }).catch(error => {
            return error
        })
    }

    /*
        clientSocket is the socket associated with the emitting client, which has an id that is different from the user id.
        sessionId is the id of the Socket IO room of the Session, same as the session id.
    */
    joinSession = (clientSocket, sessionId) => {
        if (!clientSocket.rooms[1]) { //If not already in a Session
            clientSocket.join(sessionId);
            let getData = {subaction: 'get_session_state'}
            let getSessionStateObj = {action: 'session', data: getData }
            this.socket.to(clientSocket.rooms[1]).emit("session", getSessionStateObj);
        }
        else {
            clientSocket.emit("session-error", "Client is already in a Session")
        }
    }

    leaveSession = (clientSocket, sessionId) => {
        if (clientSocket.rooms[1] && clientSocket.rooms[1] === sessionId) { //If in a Session
            clientSocket.leave(sessionId)
        }
        else {
            clientSocket.emit("session-error", "Client is not in a Session or client is not associated with the sessionId")
        }
    }

    likeSession = (clientSocket, sessionId, likes) => {
        if (clientSocket.rooms[1] && clientSocket.rooms[1] === sessionId){
            this.socket.to(clientSocket.rooms[1]).emit("likes", likes);
            mongooseQuery.updateSession(sessionId, {likes: likes});
        }
        else {
            clientSocket.emit("session-error", "Client is not in a Session or client is not associated with the sessionId")
        }
    }

    emitChat = (clientSocket, chatObj) => {
        if (clientSocket.request.user) {
            var newChatObj = this.createActionObj("chat", chatObj.username, chatObj.userId, chatObj.data)
            this.socket.to(clientSocket.rooms[1]).emit("chat", newChatObj)
            this.updateSessionState(clientSocket.rooms[1], newChatObj)
        }
        else {
            clientSocket.emit("session-error", "Client is not authenticated")
        }
    }

    emitPlayer = (clientSocket, playerObj) => {
        if (clientSocket.request.user) {
            var newPlayerObj = this.createActionObj("player", playerObj.username, playerObj.userId, playerObj.data)
            this.socket.to(clientSocket.rooms[1]).emit("player", newPlayerObj)
            this.updateSessionState(clientSocket.rooms[1], newPlayerObj)
        }
        else {
            clientSocket.emit("session-error", "Client is not authenticated or client is not the Session host")
        }
    }

    emitQueue = (clientSocket, queueObj) => {
        if (clientSocket.request.user) {
            var newQueueObj = this.createActionObj("queue", queueObj.username, queueObj.userId, queueObj.data)
            this.socket.to(clientSocket.rooms[1]).emit("queue", newQueueObj)
            this.updateSessionState(clientSocket.rooms[1], newQueueObj)
        }
        else {
            clientSocket.emit("session-error", "Client is not authenticated or client is not the Session host")
        }
    }

    emitSession = (clientSocket, sessionObj) => {
        if (clientSocket.request.user) {
            var newSessionObj = this.createActionObj("session", sessionObj.username, sessionObj.userId, sessionObj.data)
            if (sessionObj.data.subaction === 'session_state'){
                this.socket.to(clientSocket.rooms[0]).emit('session', newSessionObj)
            }
            else {
                this.socket.to(clientSocket.rooms[1]).emit("session", newSessionObj)
            }
            this.updateSessionState(clientSocket.rooms[1], newSessionObj)
        }
        else {
            clientSocket.emit("session-error", "Client is not authenticated or client is not the Session host")
        }
    }
}

module.exports = SessionServer