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
    streams: {
        type: Number
    },
    likes: {
        type: Number
    },
    live: {
        type: Boolean,
        default: false
    },
    image: {
        data: String,
        contentType: String
    }
})

module.exports = sessionSchema