const mongoose = require('mongoose')

const sessionSchema = new mongoose.Schema({
    hostId: {
        type: String,
        required: [true, 'Unique ID is required'],
        ref: "Unique user ID"
    },
    name: {
        type: String,
        required: [true, "Session must have a name"],
        ref: ""
    },
    startTime: {
        type: Number,
        require: true,
        ref: "Start timestamp with server time"
    },
    endTime: {
        type: Number,
        require: true,
        ref: "End timestamp with server time"
    },
    streams: {
        type: Number,
        require: true,
        ref: "Stream count"
    },
    likes: {
        type: Number,
        require: true,
        ref: "Like count"
    },
    initialQueue: {
        type: [String],
        require: true,
        ref: "Initial song queue where each entry is the unique Song ID from SoundCloud"
    },
    actionLog: {
        type: [String],
        require: true,
        ref: ""
    }
})

module.exports = sessionSchema