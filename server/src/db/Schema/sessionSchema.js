const mongoose = require('mongoose')

const sessionSchema = new mongoose.Schema({
    hostId: {
        type: mongoose.Schema.Types.ObjectId,
        required: [true, 'Unique ID is required'],
        ref: "User"
    },
    hostName: {
        type: String,
        required: [true, 'Unique ID matches to a hostname']
    },
    name: {
        type: String,
        required: [true, "Session must have a name"]
    },
    startTime: {
        type: Number
    },
    endTime: {
        type: Number
    },
    streams: {
        type: Number
    },
    likes: {
        type: Number
    },
    live: {
        type: Boolean,
        required: [true, "A session must be either live or passed"]
    },
    initialQueue: {
        type: [String]
    },
    actionLog: {
        type: [{
            class: {
                type: String,
                required: [true, "Action class is required"]
            },
            timestamp: {
                type: Date,
                required: [true, "Action must have a timestamp"]
            },
            username: {
                type: String,
                required: [true, "Action must contain the actor's username"]
            },
            userId: {
                type: String,
                required: [true, "Action must containe the actor's user id"]
            },
            data: {
                type: {
                    action: {
                        type: String
                    },
                    message: {
                        type: String
                    },
                    from: {
                        type: Number
                    },
                    to: {
                        type: Number
                    },
                    index: {
                        type: Number
                    },
                    songId: {
                        type: String
                    },
                    state: {
                        type: Number
                    },
                    newName: {
                        type: String
                    },
                    time: {
                        type: Date
                    }
                },
                required: [true, "Action must have data as payload"]
            }
        }]
    }
})

module.exports = sessionSchema