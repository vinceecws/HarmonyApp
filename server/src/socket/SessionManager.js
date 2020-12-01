class SessionManager {

    constructor(socket) {
        this.socket = socket
        this.initSocket()
    }

    initSocket = () => {
        this.socket.on('connect', async (socket) => {
            /* Access equivalent of PassportJS's "req.user" here as "socket.request.user" */
            console.log("Connected to Session namespace")
            console.log(socket)
        })

        // this.socket.onAny((event, ...args) => {
        //     console.log(socket)
        //     this.parseAction(event, ...args)
        // })
    }

    parseAction = (action, ...args) => {
        console.log(action)
        console.log(args)
    }



}

module.exports = SessionManager