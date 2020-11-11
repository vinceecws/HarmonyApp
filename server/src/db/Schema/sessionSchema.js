const mongoose = require('mongoose')

const sessionSchema = new mongoose.Schema({
    hostId: {
        type: String,
        required: [true, 'Unique ID is required'],
        ref: "Unique user ID"
    },
    hostName: {
        type: String,
        required: [true, 'Unique ID matches to a hostname'],
        ref: ""
    },
    name: {
        type: String,
        required: [true, "Session must have a name"],
        ref: ""
    },
    startTime: {
        type: Number,
        //required: true,
        ref: "Start timestamp with server time"
    },
    endTime: {
        type: Number,
        //required: true,
        ref: "End timestamp with server time"
    },
    streams: {
        type: Number,
        //required: true,
        ref: "Stream count"
    },
    likes: {
        type: Number,
        //required: true,
        ref: "Like count"
    },
    live: {
        type: Boolean,
        required: [true, "A session must be live in order to be displayed in the sideList"],
        ref: ""
    },
    initialQueue: {
        type: [String],
        //required: true,
        ref: "Initial song queue where each entry is the unique Song ID from SoundCloud"
    },
    actionLog: {
        type: [String],
        //required: true,
        ref: ""
    }
    
})

module.exports = sessionSchema