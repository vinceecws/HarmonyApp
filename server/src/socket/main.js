const mongooseQuery = require('../db')

module.exports = function (io, ...middlewares) {
    
    const socket = io.of('/main')
    const wrap = middleware => (socket, next) => middleware(socket.request, {}, next)
    
    middlewares.forEach(arg => socket.use(wrap(arg)))

    socket.on('connect', async (socket) => {
        /* Access equivalent of PassportJS's "req.user" here as "socket.request.user" */

        let sessions = await mongooseQuery.getSessions().catch(err => {
            socket.emit('error')
        })
        socket.emit('top-sessions', sessions, (response) => {
            if (response.status === 200) {
                console.log("Sessions acknowledged")
            }
        })
    })

    return socket
}