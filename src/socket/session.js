const mongooseQuery = require('../db')
const SessionServer = require('./SessionServer.js')

module.exports = function (mainSocket, io, ...middlewares) {
    
    const socket = io.of('/session')
    const wrap = middleware => (socket, next) => middleware(socket.request, {}, next)
    
    middlewares.forEach(arg => socket.use(wrap(arg)))

    const manager = new SessionServer(mainSocket, socket)

    return socket
}