const mongooseQuery = require('../db')

module.exports = function (io, ...arguments) {
    
    const socket = io.of('/session')
    const wrap = middleware => (socket, next) => middleware(socket.request, {}, next)
    
    arguments.forEach(arg => socket.use(wrap(arg)))

    socket.on('connect', async (socket) => {
        /* Access equivalent of PassportJS's "req.user" here as "socket.request.user" */
        console.log("Connected to Session namespace")
    })

    return socket
}