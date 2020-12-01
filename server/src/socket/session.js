const mongooseQuery = require('../db')
const SessionManager = require('./SessionManager.js')

module.exports = function (io, ...middlewares) {
    
    const socket = io.of('/session')
    const wrap = middleware => (socket, next) => middleware(socket.request, {}, next)
    
    middlewares.forEach(arg => socket.use(wrap(arg)))

    const manager = new SessionManager(socket)

    return socket
}