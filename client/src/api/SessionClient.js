class SessionClient {

    constructor(socket) {
        this.socket = socket
        this.initSocket()
    }

    initSocket = () => {
        this.socket.on('connect', async (socket) => {
            console.log("Connected to Session namespace")

        })

        this.socket.onAny((event, ...args) => {
            this.parseAction(event, ...args)
        })
    }

    joinSession = (id) => {
        this.socket.emit("join", id, (response) => {
            if (response.status === 200) {
                console.log("Session joined")
            }
        })
    }

    parseAction = (action, ...args) => {
        console.log(action)
        console.log(args)
    }
}

export default SessionClient